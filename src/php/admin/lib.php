<?php
/*
 * Shared helpers for the admin panel and the contact form handler.
 * Compatible with PHP 7.4+ and the GD extension (standard on cPanel hosting).
 */

declare(strict_types=1);

require_once __DIR__ . '/site-config.php';

define('JE_ROOT', dirname(__DIR__));                 // public_html (the site root)
define('JE_DATA', __DIR__ . '/data');                // private: blocked by admin/.htaccess
define('JE_UPLOADS', JE_ROOT . '/uploads');          // public images uploaded in the admin
define('JE_GALLERY_JSON', JE_UPLOADS . '/gallery.json');
define('JE_MAX_UPLOAD', 15 * 1024 * 1024);           // 15 MB per image

/* ---------- storage ---------- */

function je_ensure_dirs(): void
{
    foreach ([JE_DATA, JE_UPLOADS, JE_UPLOADS . '/gallery', JE_UPLOADS . '/slots'] as $dir) {
        if (!is_dir($dir)) {
            @mkdir($dir, 0755, true);
        }
    }
    // Uploaded files must never run as code, and private data must never be served.
    $guards = [
        JE_DATA . '/.htaccess' => "Require all denied\n",
        JE_UPLOADS . '/.htaccess' => "Options -Indexes\n<FilesMatch \"\\.(php|phtml|phar|php\\d|pl|py|cgi|sh)$\">\n  Require all denied\n</FilesMatch>\nRemoveHandler .php .phtml .phar\nRemoveType .php .phtml .phar\n<IfModule mod_headers.c>\n  Header set X-Content-Type-Options \"nosniff\"\n  Header set Cache-Control \"public, max-age=300, must-revalidate\"\n</IfModule>\n",
    ];
    foreach ($guards as $file => $rules) {
        if (!file_exists($file)) {
            @file_put_contents($file, $rules);
        }
    }
}

function je_read_json(string $file, $default)
{
    if (!is_file($file)) {
        return $default;
    }
    $data = json_decode((string) file_get_contents($file), true);
    return $data === null ? $default : $data;
}

function je_write_json(string $file, $data): bool
{
    $tmp = $file . '.' . bin2hex(random_bytes(4)) . '.tmp';
    $ok = file_put_contents($tmp, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), LOCK_EX) !== false;
    return $ok && rename($tmp, $file);
}

function je_h($value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function je_client_ip(): string
{
    return (string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown');
}

/* ---------- sessions, CSRF, login ---------- */

function je_session_start(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }
    $secure = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
    session_name('je_admin');
    session_set_cookie_params(['lifetime' => 0, 'path' => '/admin/', 'secure' => $secure, 'httponly' => true, 'samesite' => 'Strict']);
    session_start();
    // Sign out after two hours without activity.
    if (isset($_SESSION['seen']) && time() - $_SESSION['seen'] > 7200) {
        $_SESSION = [];
        session_regenerate_id(true);
    }
    $_SESSION['seen'] = time();
}

function je_csrf_token(): string
{
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf'];
}

function je_csrf_field(): string
{
    return '<input type="hidden" name="csrf" value="' . je_h(je_csrf_token()) . '">';
}

function je_csrf_ok(): bool
{
    return isset($_POST['csrf'], $_SESSION['csrf']) && hash_equals($_SESSION['csrf'], (string) $_POST['csrf']);
}

function je_auth(): array
{
    return je_read_json(JE_DATA . '/auth.json', []);
}

function je_is_set_up(): bool
{
    $auth = je_auth();
    return !empty($auth['user']) && !empty($auth['hash']);
}

function je_logged_in(): bool
{
    return !empty($_SESSION['user']) && je_is_set_up() && hash_equals((string) (je_auth()['user'] ?? ''), (string) $_SESSION['user']);
}

/** The one-time code that proves the person creating the first login has access to the hosting account. */
function je_setup_code(): string
{
    $file = JE_DATA . '/setup-code.txt';
    if (!is_file($file)) {
        file_put_contents($file, strtoupper(bin2hex(random_bytes(5))) . "\n");
    }
    return trim((string) file_get_contents($file));
}

/** Allow at most $max attempts per IP per $window seconds for the given action. */
function je_rate_limited(string $action, int $max, int $window, bool $record = true): bool
{
    $file = JE_DATA . '/limits.json';
    $all = je_read_json($file, []);
    $now = time();
    $key = $action . ':' . hash('sha256', je_client_ip());
    $hits = array_values(array_filter($all[$key] ?? [], function ($t) use ($now, $window) {
        return $now - (int) $t < $window;
    }));
    $limited = count($hits) >= $max;
    if ($record && !$limited) {
        $hits[] = $now;
    }
    $all[$key] = $hits;
    // Drop stale keys so the file stays small.
    foreach ($all as $k => $times) {
        if (!$times) {
            unset($all[$k]);
        }
    }
    je_write_json($file, $all);
    return $limited;
}

function je_clear_limit(string $action): void
{
    $file = JE_DATA . '/limits.json';
    $all = je_read_json($file, []);
    unset($all[$action . ':' . hash('sha256', je_client_ip())]);
    je_write_json($file, $all);
}

/* ---------- images ---------- */

/**
 * Validates an uploaded file and returns a GD image, upright and in true colour.
 * Throws RuntimeException with a message written for the site owner.
 */
function je_load_upload(array $file)
{
    if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        $codes = [
            UPLOAD_ERR_INI_SIZE => 'The file is larger than the server allows. Try a smaller photo (under ' . ini_get('upload_max_filesize') . ').',
            UPLOAD_ERR_FORM_SIZE => 'The file is too large.',
            UPLOAD_ERR_PARTIAL => 'The upload was interrupted. Please try again.',
            UPLOAD_ERR_NO_FILE => 'Choose a photo to upload.',
        ];
        throw new RuntimeException($codes[$file['error'] ?? UPLOAD_ERR_NO_FILE] ?? 'The upload failed. Please try again.');
    }
    if (!is_uploaded_file($file['tmp_name'])) {
        throw new RuntimeException('The upload failed. Please try again.');
    }
    if ($file['size'] > JE_MAX_UPLOAD) {
        throw new RuntimeException('That photo is larger than 15 MB. Please resize it and try again.');
    }
    $mime = (new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);
    $info = @getimagesize($file['tmp_name']);
    $allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!$info || !in_array($mime, $allowed, true) || !in_array($info['mime'], $allowed, true)) {
        throw new RuntimeException('Upload a JPG, PNG or WebP photo.');
    }
    if ($info[0] < 600 || $info[1] < 400) {
        throw new RuntimeException('That photo is too small. Use one at least 1200 pixels wide so it stays sharp.');
    }
    if ($info[0] * $info[1] > 40000000) {
        throw new RuntimeException('That photo has too many pixels to process. Please resize it below 40 megapixels.');
    }
    @ini_set('memory_limit', '512M');
    switch ($info['mime']) {
        case 'image/jpeg':
            $img = @imagecreatefromjpeg($file['tmp_name']);
            break;
        case 'image/png':
            $img = @imagecreatefrompng($file['tmp_name']);
            break;
        default:
            $img = function_exists('imagecreatefromwebp') ? @imagecreatefromwebp($file['tmp_name']) : false;
    }
    if (!$img) {
        throw new RuntimeException('That photo could not be read. Try saving it again as a JPG.');
    }
    // Phones store rotation in EXIF; apply it so photos are never sideways.
    if ($info['mime'] === 'image/jpeg' && function_exists('exif_read_data')) {
        $exif = @exif_read_data($file['tmp_name']);
        $turn = [3 => 180, 6 => -90, 8 => 90][(int) ($exif['Orientation'] ?? 1)] ?? 0;
        if ($turn) {
            $rotated = imagerotate($img, $turn, 0);
            if ($rotated) {
                imagedestroy($img);
                $img = $rotated;
            }
        }
    }
    if (!imageistruecolor($img)) {
        imagepalettetotruecolor($img);
    }
    return $img;
}

/** Crops to the target ratio around the centre, scales to $w×$h and saves a JPEG. */
function je_save_cover($src, string $dest, int $w, int $h): void
{
    $sw = imagesx($src);
    $sh = imagesy($src);
    $scale = max($w / $sw, $h / $sh);
    $cw = (int) round($w / $scale);
    $ch = (int) round($h / $scale);
    $out = imagecreatetruecolor($w, $h);
    imagefill($out, 0, 0, imagecolorallocate($out, 255, 255, 255));
    imagecopyresampled($out, $src, 0, 0, (int) (($sw - $cw) / 2), (int) (($sh - $ch) / 2), $w, $h, $cw, $ch);
    imageinterlace($out, true);
    imagejpeg($out, $dest, 82);
    imagedestroy($out);
}

/** Scales down to fit within $max pixels on the long side (never enlarges) and saves a JPEG. */
function je_save_fit($src, string $dest, int $max): array
{
    $sw = imagesx($src);
    $sh = imagesy($src);
    $scale = min(1, $max / max($sw, $sh));
    $w = (int) round($sw * $scale);
    $h = (int) round($sh * $scale);
    $out = imagecreatetruecolor($w, $h);
    imagefill($out, 0, 0, imagecolorallocate($out, 255, 255, 255));
    imagecopyresampled($out, $src, 0, 0, 0, 0, $w, $h, $sw, $sh);
    imageinterlace($out, true);
    imagejpeg($out, $dest, 82);
    imagedestroy($out);
    return [$w, $h];
}

/* ---------- gallery ---------- */

function je_gallery(): array
{
    return je_read_json(JE_GALLERY_JSON, []);
}

function je_save_gallery(array $items): bool
{
    return je_write_json(JE_GALLERY_JSON, array_values($items));
}

function je_clean_text(string $value, int $max): string
{
    $value = trim(preg_replace('/\s+/u', ' ', strip_tags($value)) ?? '');
    return function_exists('mb_substr') ? mb_substr($value, 0, $max) : substr($value, 0, $max);
}
