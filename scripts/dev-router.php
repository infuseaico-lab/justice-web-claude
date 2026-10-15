<?php
/*
 * Local preview with PHP's built-in server, mirroring the .htaccess rules:
 *   php -S localhost:8080 -t dist scripts/dev-router.php
 */
$root = realpath(getenv('SITE_ROOT') ?: __DIR__ . '/../dist');
$uri = urldecode((string) parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));

if (preg_match('#^/img/slot/([a-z0-9-]+)\.(jpg|webp)$#', $uri, $m)) {
    foreach (["$root/uploads/slots/$m[1].$m[2]", "$root/uploads/slots/$m[1].jpg", "$root/assets/slots/$m[1].$m[2]"] as $file) {
        if (is_file($file)) {
            header('Content-Type: ' . (substr($file, -5) === '.webp' ? 'image/webp' : 'image/jpeg'));
            header('Cache-Control: no-cache');
            readfile($file);
            return true;
        }
    }
    http_response_code(404);
    return true;
}
if (preg_match('#^/admin/(lib\.php|site-config\.php|slots\.json|data(/|$))#', $uri) || preg_match('#^/uploads/.*\.php#', $uri)) {
    http_response_code(403);
    echo 'Forbidden';
    return true;
}
if (!file_exists($root . $uri)) {
    http_response_code(404);
    readfile("$root/404.html");
    return true;
}
return false;
