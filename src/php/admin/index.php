<?php
/*
 * Justice Energy Co. website admin: gallery uploads, page photo replacement,
 * consultation requests and account settings. One file, no database.
 */

declare(strict_types=1);

require __DIR__ . '/lib.php';

je_ensure_dirs();
je_session_start();

header('X-Frame-Options: DENY');
header('X-Robots-Tag: noindex, nofollow');
header('Referrer-Policy: same-origin');
header('Cache-Control: no-store');
header("Content-Security-Policy: default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'self' 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'; base-uri 'self'");

$slots = je_read_json(__DIR__ . '/slots.json', []);
$slotIds = array_column($slots, 'id');
$view = preg_replace('/[^a-z]/', '', (string) ($_GET['view'] ?? 'gallery')) ?: 'gallery';

function flash(string $type, string $message): void
{
    $_SESSION['flash'][] = [$type, $message];
}

function go(string $view, string $anchor = ''): void
{
    header('Location: ./?view=' . rawurlencode($view) . ($anchor ? '#' . rawurlencode($anchor) : ''), true, 303);
    exit;
}

/* ---------- actions ---------- */
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = (string) ($_POST['action'] ?? '');
    if (!je_csrf_ok()) {
        flash('error', 'Your session expired. Please try again.');
        go($view);
    }

    if ($action === 'setup') {
        if (je_is_set_up()) {
            go('gallery');
        }
        if (je_rate_limited('setup', 5, 900)) {
            flash('error', 'Too many attempts. Wait 15 minutes and try again.');
            go('gallery');
        }
        $code = strtoupper(trim((string) ($_POST['code'] ?? '')));
        $user = trim((string) ($_POST['user'] ?? ''));
        $pass = (string) ($_POST['password'] ?? '');
        if (!hash_equals(je_setup_code(), $code)) {
            flash('error', 'That setup code is not right. Copy it again from admin/data/setup-code.txt.');
        } elseif (!preg_match('/^[A-Za-z0-9._@-]{3,60}$/', $user)) {
            flash('error', 'Choose a username of 3–60 letters, numbers, dots, dashes or @.');
        } elseif (strlen($pass) < 10) {
            flash('error', 'Choose a password of at least 10 characters.');
        } elseif ($pass !== (string) ($_POST['confirm'] ?? '')) {
            flash('error', 'The two passwords do not match.');
        } else {
            je_write_json(JE_DATA . '/auth.json', ['user' => $user, 'hash' => password_hash($pass, PASSWORD_DEFAULT)]);
            @unlink(JE_DATA . '/setup-code.txt');
            session_regenerate_id(true);
            $_SESSION['user'] = $user;
            flash('ok', 'Your admin login is ready.');
        }
        go('gallery');
    }

    if ($action === 'login') {
        if (je_rate_limited('login', 5, 900, false)) {
            flash('error', 'Too many failed sign-in attempts. Wait 15 minutes and try again.');
            go('gallery');
        }
        $auth = je_auth();
        $user = trim((string) ($_POST['user'] ?? ''));
        $pass = (string) ($_POST['password'] ?? '');
        if (je_is_set_up() && hash_equals((string) $auth['user'], $user) && password_verify($pass, (string) $auth['hash'])) {
            je_clear_limit('login');
            if (password_needs_rehash((string) $auth['hash'], PASSWORD_DEFAULT)) {
                $auth['hash'] = password_hash($pass, PASSWORD_DEFAULT);
                je_write_json(JE_DATA . '/auth.json', $auth);
            }
            session_regenerate_id(true);
            $_SESSION['user'] = $user;
        } else {
            je_rate_limited('login', 5, 900, true);
            flash('error', 'That username or password is not right.');
        }
        go('gallery');
    }

    if ($action === 'logout') {
        $_SESSION = [];
        session_destroy();
        header('Location: ./', true, 303);
        exit;
    }

    if (!je_logged_in()) {
        go('gallery');
    }

    switch ($action) {
        case 'gallery_upload':
            $files = $_FILES['photos'] ?? null;
            $caption = je_clean_text((string) ($_POST['caption'] ?? ''), 160);
            $category = array_key_exists((string) ($_POST['category'] ?? ''), JE_CATEGORIES) ? (string) $_POST['category'] : '';
            $items = je_gallery();
            $added = 0;
            if (!$files || !is_array($files['name'])) {
                flash('error', 'Choose one or more photos to upload.');
                go('gallery');
            }
            foreach ($files['name'] as $i => $name) {
                $one = ['name' => $name, 'type' => $files['type'][$i], 'tmp_name' => $files['tmp_name'][$i], 'error' => $files['error'][$i], 'size' => $files['size'][$i]];
                try {
                    $img = je_load_upload($one);
                    $id = date('Ymd') . '-' . bin2hex(random_bytes(5));
                    // WebP keeps gallery pages light; JPEG only on a server whose PHP has no WebP support.
                    $ext = function_exists('imagewebp') ? 'webp' : 'jpg';
                    [$w, $h] = je_save_fit($img, JE_UPLOADS . "/gallery/$id.$ext", 2000);
                    je_save_fit($img, JE_UPLOADS . "/gallery/$id-thumb.$ext", 900);
                    imagedestroy($img);
                    array_unshift($items, [
                        'id' => $id,
                        'file' => "$id.$ext",
                        'thumb' => "$id-thumb.$ext",
                        'w' => $w,
                        'h' => $h,
                        'caption' => $caption,
                        'alt' => $caption,
                        'category' => $category,
                        'added' => date('c'),
                    ]);
                    $added++;
                } catch (RuntimeException $e) {
                    flash('error', je_clean_text((string) $name, 80) . ': ' . $e->getMessage());
                }
            }
            if ($added) {
                je_save_gallery($items);
                flash('ok', $added === 1 ? 'Photo added to the gallery.' : "$added photos added to the gallery.");
            }
            go('gallery');

        case 'gallery_update':
            $items = je_gallery();
            foreach ($items as &$item) {
                if ($item['id'] === ($_POST['id'] ?? '')) {
                    $item['caption'] = je_clean_text((string) ($_POST['caption'] ?? ''), 160);
                    $item['alt'] = je_clean_text((string) ($_POST['alt'] ?? ''), 200);
                    $item['category'] = array_key_exists((string) ($_POST['category'] ?? ''), JE_CATEGORIES) ? (string) $_POST['category'] : '';
                }
            }
            unset($item);
            je_save_gallery($items);
            flash('ok', 'Photo details saved.');
            go('gallery', 'item-' . (string) ($_POST['id'] ?? ''));

        case 'gallery_move':
            $items = je_gallery();
            $ids = array_column($items, 'id');
            $at = array_search($_POST['id'] ?? '', $ids, true);
            $to = $at === false ? false : $at + (($_POST['dir'] ?? '') === 'up' ? -1 : 1);
            if ($at !== false && $to >= 0 && $to < count($items)) {
                [$items[$at], $items[$to]] = [$items[$to], $items[$at]];
                je_save_gallery($items);
            }
            go('gallery', 'item-' . (string) ($_POST['id'] ?? ''));

        case 'gallery_delete':
            $items = je_gallery();
            foreach ($items as $k => $item) {
                if ($item['id'] === ($_POST['id'] ?? '')) {
                    @unlink(JE_UPLOADS . '/gallery/' . basename($item['file']));
                    @unlink(JE_UPLOADS . '/gallery/' . basename($item['thumb']));
                    unset($items[$k]);
                }
            }
            je_save_gallery($items);
            flash('ok', 'Photo deleted.');
            go('gallery');

        case 'slot_upload':
            $slot = (string) ($_POST['slot'] ?? '');
            if (!in_array($slot, $slotIds, true)) {
                go('photos');
            }
            try {
                $img = je_load_upload($_FILES['photo'] ?? []);
                je_save_cover($img, JE_UPLOADS . "/slots/$slot.jpg", 1600, 1200);
                je_save_cover($img, JE_UPLOADS . "/slots/$slot-800.jpg", 800, 600);
                imagedestroy($img);
                flash('ok', 'Photo replaced. It is live on the site now (you may need to refresh the page).');
            } catch (RuntimeException $e) {
                flash('error', $e->getMessage());
            }
            go('photos', 'slot-' . $slot);

        case 'slot_reset':
            $slot = (string) ($_POST['slot'] ?? '');
            if (in_array($slot, $slotIds, true)) {
                foreach (["$slot.jpg", "$slot-800.jpg", "$slot.webp", "$slot-800.webp"] as $file) {
                    @unlink(JE_UPLOADS . '/slots/' . $file);
                }
                flash('ok', 'The original image is back.');
            }
            go('photos', 'slot-' . $slot);

        case 'message_delete':
            $messages = je_read_json(JE_DATA . '/messages.json', []);
            $messages = array_values(array_filter($messages, function ($m) {
                return ($m['id'] ?? '') !== ($_POST['id'] ?? '');
            }));
            je_write_json(JE_DATA . '/messages.json', $messages);
            flash('ok', 'Request deleted.');
            go('messages');

        case 'password':
            $auth = je_auth();
            $new = (string) ($_POST['new'] ?? '');
            if (!password_verify((string) ($_POST['current'] ?? ''), (string) $auth['hash'])) {
                flash('error', 'Your current password is not right.');
            } elseif (strlen($new) < 10) {
                flash('error', 'Choose a new password of at least 10 characters.');
            } elseif ($new !== (string) ($_POST['confirm'] ?? '')) {
                flash('error', 'The two new passwords do not match.');
            } else {
                $auth['hash'] = password_hash($new, PASSWORD_DEFAULT);
                je_write_json(JE_DATA . '/auth.json', $auth);
                session_regenerate_id(true);
                flash('ok', 'Password changed.');
            }
            go('account');
    }
    go($view);
}

/* ---------- page ---------- */
$flashes = $_SESSION['flash'] ?? [];
unset($_SESSION['flash']);
$csrf = je_csrf_field();
$categoryOptions = function (string $selected): string {
    $out = '<option value="">No category</option>';
    foreach (JE_CATEGORIES as $value => $label) {
        $out .= '<option value="' . je_h($value) . '"' . ($value === $selected ? ' selected' : '') . '>' . je_h($label) . '</option>';
    }
    return $out;
};
$version = function (string $file): string {
    return is_file($file) ? '?v=' . filemtime($file) : '';
};
?><!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Website admin · <?= je_h(JE_SITE_NAME) ?></title>
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;600;700;800&display=swap">
<style>
:root { --navy: #1f3354; --blue: #406093; --bright: #4a8be0; --green: #93d16b; --green-ink: #2f5d14; --line: #dfe6f1; --soft: #f3f6fb; --muted: #5c6a80; --red: #b42318; }
* { box-sizing: border-box; }
body { margin: 0; font: 16px/1.5 'Nunito Sans', system-ui, -apple-system, 'Segoe UI', Arial, sans-serif; color: var(--navy); background: var(--soft); }
a { color: var(--blue); }
h1, h2, h3 { margin: 0 0 .4em; line-height: 1.2; }
h1 { font-size: 1.6rem; } h2 { font-size: 1.25rem; } h3 { font-size: 1.05rem; }
p { margin: 0 0 1em; }
.top { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 14px 24px; background: var(--navy); color: #fff; }
.top a { color: #fff; }
.brand { display: flex; align-items: center; gap: 10px; font-weight: 800; text-decoration: none; }
.brand img { width: 34px; height: 34px; }
.top form { margin: 0; }
.tabs { display: flex; flex-wrap: wrap; gap: 6px; padding: 12px 24px 0; background: #fff; border-bottom: 1px solid var(--line); }
.tabs a { padding: 10px 16px; border-radius: 10px 10px 0 0; text-decoration: none; font-weight: 700; color: var(--muted); }
.tabs a[aria-current] { color: var(--blue); background: var(--soft); box-shadow: inset 0 -3px 0 var(--blue); }
main { max-width: 1180px; margin: 0 auto; padding: 28px 24px 64px; }
.card { background: #fff; border: 1px solid var(--line); border-radius: 16px; padding: 22px; }
.stack > * + * { margin-top: 18px; }
.grid { display: grid; gap: 18px; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); }
label { display: block; font-weight: 700; font-size: .95rem; margin: 10px 0 6px; }
input[type=text], input[type=password], select, textarea { width: 100%; min-height: 44px; padding: 10px 12px; border: 1.5px solid #ccd6e5; border-radius: 10px; font: inherit; background: #fff; color: inherit; }
input[type=file] { width: 100%; padding: 10px; border: 1.5px dashed #b9c6da; border-radius: 10px; background: var(--soft); font: inherit; }
input:focus, select:focus, textarea:focus { outline: 3px solid rgba(74,139,224,.35); border-color: var(--bright); }
.btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 42px; padding: 9px 18px; border: 0; border-radius: 999px; background: var(--blue); color: #fff; font: inherit; font-weight: 700; cursor: pointer; text-decoration: none; }
.btn:hover { background: #324d7a; }
.btn.green { background: var(--green); color: var(--navy); }
.btn.green:hover { background: #7cbf52; }
.btn.light { background: var(--soft); color: var(--navy); border: 1px solid var(--line); }
.btn.danger { background: #fff; color: var(--red); border: 1px solid #f1c3bf; }
.btn.small { min-height: 34px; padding: 6px 12px; font-size: .9rem; }
.row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.muted { color: var(--muted); }
.small { font-size: .9rem; }
.flash { padding: 12px 16px; border-radius: 12px; margin-bottom: 16px; font-weight: 600; }
.flash.ok { background: #eaf7e0; color: var(--green-ink); }
.flash.error { background: #fdecea; color: var(--red); }
.thumb { aspect-ratio: 4 / 3; border-radius: 12px; overflow: hidden; background: var(--soft); margin-bottom: 12px; }
.thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
.badge { display: inline-block; padding: 3px 10px; border-radius: 999px; background: #eaf7e0; color: var(--green-ink); font-size: .8rem; font-weight: 700; }
.badge.default { background: var(--soft); color: var(--muted); }
details summary { cursor: pointer; font-weight: 700; color: var(--blue); }
.login { max-width: 420px; margin: 8vh auto; }
.code { font: 600 1rem ui-monospace, SFMono-Regular, Menlo, monospace; background: var(--soft); padding: 2px 8px; border-radius: 6px; }
table { width: 100%; border-collapse: collapse; background: #fff; }
th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid var(--line); vertical-align: top; font-size: .95rem; }
th { background: var(--soft); }
.table-wrap { overflow-x: auto; border: 1px solid var(--line); border-radius: 14px; }
@media (max-width: 640px) { .top, .tabs, main { padding-left: 16px; padding-right: 16px; } }
</style>
</head>
<body>
<?php if (!je_is_set_up()): $code = je_setup_code(); ?>
  <main class="login">
    <div class="card stack">
      <h1>Set up the website admin</h1>
      <p>Create the login you will use to manage photos. To prove you own this website, enter the setup code saved on the server: in cPanel, open <strong>File Manager</strong>, go to <span class="code">public_html/admin/data/</span> and open <span class="code">setup-code.txt</span>.</p>
      <?php foreach ($flashes as [$type, $msg]): ?><div class="flash <?= je_h($type) ?>"><?= je_h($msg) ?></div><?php endforeach; ?>
      <form method="post" action="./">
        <?= $csrf ?><input type="hidden" name="action" value="setup">
        <label for="code">Setup code</label><input id="code" name="code" type="text" autocomplete="off" required>
        <label for="user">Username</label><input id="user" name="user" type="text" autocomplete="username" required>
        <label for="password">Password (at least 10 characters)</label><input id="password" name="password" type="password" autocomplete="new-password" minlength="10" required>
        <label for="confirm">Repeat password</label><input id="confirm" name="confirm" type="password" autocomplete="new-password" minlength="10" required>
        <p></p><button class="btn green" type="submit">Create login</button>
      </form>
    </div>
  </main>
<?php elseif (!je_logged_in()): ?>
  <main class="login">
    <div class="card stack">
      <h1>Website admin</h1>
      <p class="muted"><?= je_h(JE_SITE_NAME) ?></p>
      <?php foreach ($flashes as [$type, $msg]): ?><div class="flash <?= je_h($type) ?>"><?= je_h($msg) ?></div><?php endforeach; ?>
      <form method="post" action="./">
        <?= $csrf ?><input type="hidden" name="action" value="login">
        <label for="user">Username</label><input id="user" name="user" type="text" autocomplete="username" required autofocus>
        <label for="password">Password</label><input id="password" name="password" type="password" autocomplete="current-password" required>
        <p></p><button class="btn" type="submit">Sign in</button>
      </form>
    </div>
  </main>
<?php else: ?>
  <header class="top">
    <a class="brand" href="/" target="_blank" rel="noopener"><img src="/assets/img/favicon.svg" alt=""> <?= je_h(JE_SITE_NAME) ?> <span class="small" style="font-weight:600;opacity:.8">· View site ↗</span></a>
    <form method="post" action="./"><?= $csrf ?><input type="hidden" name="action" value="logout"><button class="btn light small" type="submit">Sign out</button></form>
  </header>
  <nav class="tabs" aria-label="Admin sections">
    <?php foreach (['gallery' => 'Gallery', 'photos' => 'Page photos', 'messages' => 'Consultation requests', 'account' => 'Account'] as $key => $label): ?>
      <a href="./?view=<?= $key ?>"<?= $view === $key ? ' aria-current="page"' : '' ?>><?= je_h($label) ?></a>
    <?php endforeach; ?>
  </nav>
  <main>
    <?php foreach ($flashes as [$type, $msg]): ?><div class="flash <?= je_h($type) ?>" role="status"><?= je_h($msg) ?></div><?php endforeach; ?>

    <?php if ($view === 'photos'): ?>
      <h1>Page photos</h1>
      <p class="muted">Replace the photo shown in each spot on the website. Photos are cropped to a 4:3 landscape shape automatically, so keep the subject near the centre. Use photos at least 1600 pixels wide.</p>
      <div class="grid">
        <?php foreach ($slots as $slot): $override = JE_UPLOADS . '/slots/' . $slot['id'] . '.jpg'; $custom = is_file($override); ?>
          <section class="card" id="slot-<?= je_h($slot['id']) ?>">
            <div class="thumb"><img src="/img/slot/<?= je_h($slot['id']) ?>-800.jpg<?= $custom ? '?v=' . filemtime($override) : '' ?>" alt="Current photo: <?= je_h($slot['label']) ?>" loading="lazy"></div>
            <div class="row" style="justify-content:space-between"><h2 style="margin:0"><?= je_h($slot['label']) ?></h2><span class="badge<?= $custom ? '' : ' default' ?>"><?= $custom ? 'Your photo' : 'Original' ?></span></div>
            <p class="small muted" style="margin-top:6px">Shown on: <?= je_h($slot['usedOn']) ?></p>
            <form method="post" action="./?view=photos" enctype="multipart/form-data">
              <?= $csrf ?><input type="hidden" name="action" value="slot_upload"><input type="hidden" name="slot" value="<?= je_h($slot['id']) ?>">
              <label for="f-<?= je_h($slot['id']) ?>" class="small">Replace with</label>
              <input id="f-<?= je_h($slot['id']) ?>" type="file" name="photo" accept="image/jpeg,image/png,image/webp" required>
              <div class="row" style="margin-top:10px">
                <button class="btn small" type="submit">Upload and replace</button>
              </div>
            </form>
            <?php if ($custom): ?>
              <form method="post" action="./?view=photos" style="margin-top:8px" onsubmit="return confirm('Go back to the original image for this spot?')">
                <?= $csrf ?><input type="hidden" name="action" value="slot_reset"><input type="hidden" name="slot" value="<?= je_h($slot['id']) ?>">
                <button class="btn danger small" type="submit">Restore original</button>
              </form>
            <?php endif; ?>
          </section>
        <?php endforeach; ?>
      </div>

    <?php elseif ($view === 'messages'): $messages = je_read_json(JE_DATA . '/messages.json', []); ?>
      <h1>Consultation requests</h1>
      <p class="muted">Every request sent through the website form is saved here, as well as emailed to <?= je_h(JE_FORM_TO) ?>.</p>
      <?php if (!$messages): ?>
        <div class="card"><p style="margin:0">No requests yet.</p></div>
      <?php else: ?>
        <div class="table-wrap"><table>
          <thead><tr><th>Received</th><th>Name</th><th>Contact</th><th>Property</th><th>Interest</th><th>Message</th><th></th></tr></thead>
          <tbody>
          <?php foreach ($messages as $m): ?>
            <tr>
              <td><?= je_h(date('M j, Y g:i a', strtotime((string) $m['received']))) ?></td>
              <td><?= je_h($m['name']) ?></td>
              <td><a href="mailto:<?= je_h($m['email']) ?>"><?= je_h($m['email']) ?></a><br><a href="tel:<?= je_h(preg_replace('/[^0-9+]/', '', (string) $m['phone'])) ?>"><?= je_h($m['phone']) ?></a></td>
              <td><?= je_h($m['location']) ?><?= $m['property_type'] ? '<br><span class="muted">' . je_h($m['property_type']) . '</span>' : '' ?></td>
              <td><?= je_h($m['services']) ?><?= $m['program'] ? '<br><span class="muted">Program: ' . je_h($m['program']) . '</span>' : '' ?></td>
              <td style="min-width:220px"><?= nl2br(je_h($m['message'])) ?></td>
              <td><form method="post" action="./?view=messages" onsubmit="return confirm('Delete this request?')"><?= $csrf ?><input type="hidden" name="action" value="message_delete"><input type="hidden" name="id" value="<?= je_h($m['id']) ?>"><button class="btn danger small" type="submit">Delete</button></form></td>
            </tr>
          <?php endforeach; ?>
          </tbody>
        </table></div>
      <?php endif; ?>

    <?php elseif ($view === 'account'): ?>
      <h1>Account</h1>
      <div class="card" style="max-width:480px">
        <p>Signed in as <strong><?= je_h($_SESSION['user']) ?></strong>.</p>
        <form method="post" action="./?view=account">
          <?= $csrf ?><input type="hidden" name="action" value="password">
          <label for="current">Current password</label><input id="current" name="current" type="password" autocomplete="current-password" required>
          <label for="new">New password (at least 10 characters)</label><input id="new" name="new" type="password" autocomplete="new-password" minlength="10" required>
          <label for="confirm">Repeat new password</label><input id="confirm" name="confirm" type="password" autocomplete="new-password" minlength="10" required>
          <p></p><button class="btn" type="submit">Change password</button>
        </form>
      </div>

    <?php else: $items = je_gallery(); ?>
      <div class="row" style="justify-content:space-between;margin-bottom:12px"><h1 style="margin:0">Gallery</h1><a class="btn light small" href="/gallery/" target="_blank" rel="noopener">View gallery page ↗</a></div>
      <section class="card" style="margin-bottom:24px">
        <h2>Add photos</h2>
        <form method="post" action="./?view=gallery" enctype="multipart/form-data">
          <?= $csrf ?><input type="hidden" name="action" value="gallery_upload">
          <label for="photos">Photos (you can choose several)</label>
          <input id="photos" type="file" name="photos[]" accept="image/jpeg,image/png,image/webp" multiple required>
          <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px">
            <div><label for="caption">Caption <span class="muted">(optional, used for all chosen photos)</span></label><input id="caption" name="caption" type="text" maxlength="160" placeholder="Heat pump water heater install, Whittier"></div>
            <div><label for="category">Category</label><select id="category" name="category"><?= $categoryOptions('') ?></select></div>
          </div>
          <p class="small muted" style="margin-top:10px">JPG, PNG or WebP up to 15 MB each. Large photos are resized automatically.</p>
          <button class="btn green" type="submit">Upload to gallery</button>
        </form>
      </section>
      <?php if (!$items): ?>
        <div class="card"><p style="margin:0">The gallery is empty. Photos you upload appear on the <a href="/gallery/" target="_blank" rel="noopener">gallery page</a> straight away, newest first.</p></div>
      <?php else: ?>
        <p class="muted"><?= count($items) ?> photo<?= count($items) === 1 ? '' : 's' ?>. The first photo here shows first on the gallery page.</p>
        <div class="grid">
          <?php foreach ($items as $i => $item): ?>
            <section class="card" id="item-<?= je_h($item['id']) ?>">
              <div class="thumb"><img src="/uploads/gallery/<?= je_h($item['thumb']) ?>" alt="<?= je_h($item['alt'] ?: $item['caption']) ?>" loading="lazy"></div>
              <p style="font-weight:700;margin-bottom:4px"><?= $item['caption'] !== '' ? je_h($item['caption']) : '<span class="muted">No caption</span>' ?></p>
              <p class="small muted"><?= je_h(JE_CATEGORIES[$item['category']] ?? 'No category') ?></p>
              <div class="row">
                <form method="post" action="./?view=gallery"><?= $csrf ?><input type="hidden" name="action" value="gallery_move"><input type="hidden" name="id" value="<?= je_h($item['id']) ?>"><input type="hidden" name="dir" value="up"><button class="btn light small" type="submit"<?= $i === 0 ? ' disabled' : '' ?> aria-label="Move earlier">↑ Earlier</button></form>
                <form method="post" action="./?view=gallery"><?= $csrf ?><input type="hidden" name="action" value="gallery_move"><input type="hidden" name="id" value="<?= je_h($item['id']) ?>"><input type="hidden" name="dir" value="down"><button class="btn light small" type="submit"<?= $i === count($items) - 1 ? ' disabled' : '' ?> aria-label="Move later">↓ Later</button></form>
              </div>
              <details style="margin-top:12px">
                <summary>Edit details</summary>
                <form method="post" action="./?view=gallery">
                  <?= $csrf ?><input type="hidden" name="action" value="gallery_update"><input type="hidden" name="id" value="<?= je_h($item['id']) ?>">
                  <label for="c-<?= je_h($item['id']) ?>">Caption</label><input id="c-<?= je_h($item['id']) ?>" name="caption" type="text" maxlength="160" value="<?= je_h($item['caption']) ?>">
                  <label for="a-<?= je_h($item['id']) ?>">Description for screen readers and Google</label><input id="a-<?= je_h($item['id']) ?>" name="alt" type="text" maxlength="200" value="<?= je_h($item['alt']) ?>" placeholder="What the photo shows">
                  <label for="k-<?= je_h($item['id']) ?>">Category</label><select id="k-<?= je_h($item['id']) ?>" name="category"><?= $categoryOptions((string) $item['category']) ?></select>
                  <div class="row" style="margin-top:12px"><button class="btn small" type="submit">Save</button></div>
                </form>
                <form method="post" action="./?view=gallery" style="margin-top:8px" onsubmit="return confirm('Delete this photo from the gallery?')">
                  <?= $csrf ?><input type="hidden" name="action" value="gallery_delete"><input type="hidden" name="id" value="<?= je_h($item['id']) ?>">
                  <button class="btn danger small" type="submit">Delete photo</button>
                </form>
              </details>
            </section>
          <?php endforeach; ?>
        </div>
      <?php endif; ?>
    <?php endif; ?>
  </main>
<?php endif; ?>
</body>
</html>
