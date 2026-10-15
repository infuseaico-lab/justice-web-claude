<?php
/*
 * Consultation form handler. Emails each request to the address in
 * admin/site-config.php and saves a copy that the admin lists under
 * "Consultation requests". Answers JSON to the site's script and redirects
 * to /thank-you/ for browsers without JavaScript.
 */

declare(strict_types=1);

require __DIR__ . '/admin/lib.php';

je_ensure_dirs();

$wantsJson = stripos((string) ($_SERVER['HTTP_ACCEPT'] ?? ''), 'application/json') !== false;

function respond(bool $ok, string $message, bool $json, int $status = 200): void
{
    if ($json) {
        http_response_code($ok ? 200 : $status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['ok' => $ok, 'message' => $message]);
    } elseif ($ok) {
        header('Location: /thank-you/', true, 303);
    } else {
        http_response_code($status);
        header('Content-Type: text/html; charset=utf-8');
        echo '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Request not sent</title>'
            . '<body style="font:18px/1.5 system-ui,sans-serif;max-width:560px;margin:10vh auto;padding:0 16px">'
            . '<h1>Your request was not sent</h1><p>' . je_h($message) . '</p>'
            . '<p><a href="/contact/">Back to the form</a> or call <a href="tel:' . je_h(JE_PHONE_HREF) . '">' . je_h(JE_PHONE) . '</a>.</p></body>';
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    respond(false, 'Use the form on the contact page.', $wantsJson, 405);
}

// Spam trap: real visitors never see or fill this field. Pretend it worked.
if (trim((string) ($_POST['bot-field'] ?? '')) !== '') {
    respond(true, 'Thank you.', $wantsJson);
}

if (je_rate_limited('contact', 8, 3600)) {
    respond(false, 'We have received several requests from your connection in the last hour. Please call us instead.', $wantsJson, 429);
}

$field = function (string $name, int $max) {
    return je_clean_text((string) ($_POST[$name] ?? ''), $max);
};
$name = str_replace(["\r", "\n"], ' ', $field('name', 100));
$email = str_replace(["\r", "\n"], '', $field('email', 150));
$phone = $field('phone', 40);
$location = $field('location', 120);
$propertyType = $field('property_type', 60);
$program = $field('program', 60);
$services = $field('services_selected', 300);
if ($services === '' && isset($_POST['service']) && is_array($_POST['service'])) {
    $services = je_clean_text(implode(', ', array_map('strval', $_POST['service'])), 300);
}
$message = trim(substr(strip_tags((string) ($_POST['message'] ?? '')), 0, 3000));
$page = $field('page', 300);

$errors = [];
if ($name === '') $errors[] = 'your name';
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'a valid email address';
if (strlen(preg_replace('/\D/', '', $phone)) < 10) $errors[] = 'a phone number with at least 10 digits';
if ($location === '') $errors[] = 'the property city or ZIP code';
if (($_POST['consent'] ?? '') !== 'yes') $errors[] = 'your agreement to be contacted';
if ($errors) {
    respond(false, 'Please include ' . implode(', ', $errors) . '.', $wantsJson, 422);
}

$programName = JE_PROGRAMS[$program] ?? $program;
$record = [
    'id' => date('YmdHis') . '-' . bin2hex(random_bytes(3)),
    'received' => date('c'),
    'name' => $name,
    'email' => $email,
    'phone' => $phone,
    'location' => $location,
    'property_type' => $propertyType,
    'program' => $programName,
    'services' => $services ?: 'Not specified',
    'message' => $message,
    'page' => $page,
];

// Keep a copy first, so no request is lost if email delivery fails.
$file = JE_DATA . '/messages.json';
$all = je_read_json($file, []);
array_unshift($all, $record);
je_write_json($file, array_slice($all, 0, 1000));

$host = parse_url(JE_SITE_URL, PHP_URL_HOST) ?: 'localhost';
$host = preg_replace('/^www\./', '', $host);
$body = "New consultation request from the website\n\n"
    . "Name: $name\nEmail: $email\nPhone: $phone\nProperty location: $location\n"
    . "Property type: " . ($propertyType ?: '-') . "\nServices: " . ($services ?: 'Not specified') . "\nProgram: " . ($programName ?: '-') . "\n\n"
    . "Message:\n" . ($message ?: '-') . "\n\n"
    . "Sent from: " . ($page ?: JE_SITE_URL) . "\nReceived: " . date('l, F j, Y g:i a T') . "\n";
$headers = [
    'From: ' . JE_SITE_NAME . ' Website <no-reply@' . $host . '>',
    'Reply-To: ' . $name . ' <' . $email . '>',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'X-Mailer: PHP/' . PHP_VERSION,
];
$subject = '=?UTF-8?B?' . base64_encode('New consultation request: ' . $name) . '?=';
@mail(JE_FORM_TO, $subject, $body, implode("\r\n", $headers), '-f no-reply@' . $host);

respond(true, 'Thank you.', $wantsJson);
