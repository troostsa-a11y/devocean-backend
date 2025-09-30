<?php
declare(strict_types=1);

date_default_timezone_set('Africa/Maputo');
session_start();

/* ---------- helpers ---------- */
function redirect_back(bool $ok): never {
  header('Location: /?sent=' . ($ok ? '1' : '0') . '#contact', true, 303);
  exit;
}
function clean(string $s): string {
  $s = trim($s);
  return str_replace(["\r", "\n"], ' ', $s); // header-injection guard
}

/* ---------- load mailer config from .secrets ---------- */
// /var/www/vhosts/devoceanlodge.com/.secrets/mail.php must return:
/*
return [
  'host'       => 'devoceanlodge.com',
  'port'       => 465,
  'secure'     => 'ssl',          // 'ssl' for 465, 'tls' for 587
  'username'   => 'info@devoceanlodge.com',
  'password'   => '********',
  'from_email' => 'info@devoceanlodge.com',
  'from_name'  => 'DEVOCEAN Lodge',
  'to_email'   => 'info@devoceanlodge.com',
  'to_name'    => 'DEVOCEAN Lodge',
];
*/

$cfgFile = dirname(__DIR__) . '/.secrets/mail.php';
$cfg = is_file($cfgFile) ? require $cfgFile : null;
if (
  !is_array($cfg) ||
  empty($cfg['host']) ||
  empty($cfg['port']) ||
  empty($cfg['username']) ||
  empty($cfg['password'])
) {
  error_log('Mailer config missing/invalid at ' . $cfgFile);
  redirect_back(false);
}

/* ---------- method / basic anti-abuse ---------- */
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  redirect_back(false);
}

// Honeypot: if bots fill it, pretend success
if (!empty($_POST['website'])) {
  redirect_back(true);
}

// 15s per-session throttle
$now = time();
if (isset($_SESSION['last_submit']) && ($now - (int)$_SESSION['last_submit']) < 15) {
  redirect_back(false);
}
$_SESSION['last_submit'] = $now;

/* ---------- collect & validate ---------- */
$name     = clean($_POST['name'] ?? '');
$emailRaw = $_POST['email'] ?? '';
$email    = filter_var($emailRaw, FILTER_VALIDATE_EMAIL);
$msg      = trim((string)($_POST['message'] ?? ''));

// Dates: ISO (hidden) or dd/mm/yyyy fallback
$checkin  = $_POST['checkin_iso']  ?? '';
$checkout = $_POST['checkout_iso'] ?? '';

if (!$checkin && !empty($_POST['checkin'])) {
  $dt = DateTime::createFromFormat('d/m/Y', $_POST['checkin']);
  $checkin = $dt ? $dt->format('Y-m-d') : '';
}
if (!$checkout && !empty($_POST['checkout'])) {
  $dt = DateTime::createFromFormat('d/m/Y', $_POST['checkout']);
  $checkout = $dt ? $dt->format('Y-m-d') : '';
}

if (!$name || !$email) {
  redirect_back(false);
}
if (strlen($name) > 80)   $name = substr($name, 0, 80);
if (strlen($msg)  > 2000) $msg  = substr($msg, 0, 2000);

/* ---------- compose message ---------- */
$lines = [
  "New enquiry from devoceanlodge.com",
  "-----------------------------------",
  "Name: $name",
  "Email: $email",
  "Check-in: "  . ($checkin  ?: '(not provided)'),
  "Check-out: " . ($checkout ?: '(not provided)'),
  "IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'),
  "",
  "Message:",
  ($msg ?: '(no message)'),
];
$bodyText = implode("\n", $lines);
$bodyHtml = nl2br(htmlentities($bodyText));

/* ---------- load PHPMailer (flat layout in /vendor/phpmailer) ---------- */
$base = __DIR__ . '/vendor/phpmailer';
require $base . '/Exception.php';
require $base . '/PHPMailer.php';
require $base . '/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;

/* ---------- send main message ---------- */
try {
  $mail = new PHPMailer(true);
  $mail->CharSet = 'UTF-8';

  $mail->isSMTP();
  $mail->Host       = (string)$cfg['host'];
  $mail->Port       = (int)$cfg['port'];
  $mail->SMTPAuth   = true;
  $mail->Username   = (string)$cfg['username'];
  $mail->Password   = (string)$cfg['password'];

  $secure = strtolower((string)($cfg['secure'] ?? 'ssl'));
  $mail->SMTPSecure = ($secure === 'ssl')
    ? PHPMailer::ENCRYPTION_SMTPS   // 465
    : PHPMailer::ENCRYPTION_STARTTLS; // 587

  $fromEmail = (string)($cfg['from_email'] ?? $cfg['username']);
  $fromName  = (string)($cfg['from_name']  ?? 'DEVOCEAN Lodge');
  $toEmail   = (string)($cfg['to_email']   ?? $fromEmail);
  $toName    = (string)($cfg['to_name']    ?? $fromName);

  $mail->setFrom($fromEmail, $fromName);
  $mail->addAddress($toEmail, $toName);
  $mail->addReplyTo($email, $name);

  $mail->Subject = 'Website enquiry - DEVOCEAN Lodge';
  $mail->isHTML(true);
  $mail->Body    = $bodyHtml;
  $mail->AltBody = $bodyText;

  $mail->send();
} catch (\Throwable $e) {
  error_log('Contact form error: ' . $e->getMessage());
  redirect_back(false);
}

/* ---------- auto-reply to guest (localized, non-blocking) ---------- */
try {
  $ack = new PHPMailer(true);
  $ack->CharSet = 'UTF-8';

  $ack->isSMTP();
  $ack->Host       = (string)$cfg['host'];
  $ack->Port       = (int)$cfg['port'];
  $ack->SMTPAuth   = true;
  $ack->Username   = (string)$cfg['username'];
  $ack->Password   = (string)$cfg['password'];
  $ack->SMTPSecure = ($secure === 'ssl')
    ? PHPMailer::ENCRYPTION_SMTPS
    : PHPMailer::ENCRYPTION_STARTTLS;

  $ack->setFrom($fromEmail, 'DEVOCEAN Lodge');
  $ack->addAddress($email, $name);
  $ack->addReplyTo($fromEmail, 'DEVOCEAN Lodge');

  // reduce loops / hint to filters
  $ack->addCustomHeader('Auto-Submitted', 'auto-replied');
  $ack->addCustomHeader('X-Auto-Response-Suppress', 'All');

  /* --- localization pulled from the form --- */
  $lang = strtolower((string)($_POST['lang'] ?? 'en'));
  if (!in_array($lang, ['en','pt','nl','fr','it','de','es'], true)) {
    $lang = 'en';
  }

 // HotelRunner locale by language
$localeByLang = [
  'en'=>'en-US','pt'=>'pt-BR','nl'=>'nl-NL','fr'=>'fr-FR',
  'it'=>'it-IT','de'=>'de-DE','es'=>'es-ES'
];
$hrLocale = $localeByLang[$lang] ?? 'en-US';

// Currency from the form (optional). Fallback = USD.
$allowedCurrencies = ['USD','MZN','ZAR','EUR','GBP'];
$currency = strtoupper((string)($_POST['currency'] ?? 'USD'));
if (!in_array($currency, $allowedCurrencies, true)) {
  $currency = 'USD';
}

// Final localized CTA URL
$ctaHref = "https://book.devoceanlodge.com/bv3/search?locale={$hrLocale}&currency={$currency}";

  $hi = [
    'en'=>'Hi','pt'=>'Olá','nl'=>'Hoi','fr'=>'Bonjour',
    'it'=>'Ciao','de'=>'Hallo','es'=>'Hola',
  ];

  $subjectMap = [
    'en'=>"Thanks — DEVOCEAN Lodge",
    'pt'=>"Obrigado — DEVOCEAN Lodge",
    'nl'=>"Bedankt — DEVOCEAN Lodge",
    'fr'=>"Merci — DEVOCEAN Lodge",
    'it'=>"Grazie — DEVOCEAN Lodge",
    'de'=>"Danke — DEVOCEAN Lodge",
    'es'=>"Gracias — DEVOCEAN Lodge",
  ];

  $textMap = [
    'en'=>"Thanks for reaching out to DEVOCEAN Lodge. We’ve received your message and will get back to you shortly.",
    'pt'=>"Obrigado por entrar em contato com o DEVOCEAN Lodge. Recebemos sua mensagem e entraremos em contato em breve.",
    'nl'=>"Bedankt voor je bericht aan DEVOCEAN Lodge. We nemen snel contact op.",
    'fr'=>"Merci d’avoir contacté DEVOCEAN Lodge. Nous vous répondrons prochainement.",
    'it'=>"Grazie per aver contattato DEVOCEAN Lodge. Ti risponderemo a breve.",
    'de'=>"Danke für Ihre Nachricht an DEVOCEAN Lodge. Wir melden uns bald.",
    'es'=>"Gracias por contactar con DEVOCEAN Lodge. Te responderemos en breve.",
  ];

  if (!isset($textMap[$lang])) $lang = 'en';
  $greet   = $hi[$lang] ?? 'Hi';
  $subject = $subjectMap[$lang] ?? $subjectMap['en'];
  $text    = $textMap[$lang];

  $safeName = htmlspecialchars($name, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');

  // Build localized HotelRunner link
  $localeByLang = [
    'en'=>'en-US','pt'=>'pt-BR','nl'=>'nl-NL','fr'=>'fr-FR',
    'it'=>'it-IT','de'=>'de-DE','es'=>'es-ES'
  ];
  $hrLocale = $localeByLang[$lang] ?? 'en-US';

  // Currency from form (fallback USD)
  $allowedCurrencies = ['USD','MZN','ZAR','EUR','GBP'];
  $currency = strtoupper((string)($_POST['currency'] ?? 'USD'));
  if (!in_array($currency, $allowedCurrencies, true)) {
    $currency = 'USD';
  }

  $ctaHref = "https://book.devoceanlodge.com/bv3/search?locale={$hrLocale}&currency={$currency}";

  // small translation for the CTA label
  $cta = [
    'en'=>'Book your stay','pt'=>'Reservar','nl'=>'Boek je verblijf',
    'fr'=>'Réserver','it'=>'Prenota','de'=>'Jetzt buchen','es'=>'Reservar'
  ][$lang] ?? 'Book your stay';

  $ack->Subject = $subject;
  $ack->isHTML(true);
  $ack->Body =
    '<div style="font:16px/1.5 -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0f172a">' .
      '<p>' . $greet . ' ' . $safeName . ',</p>' .
      '<p>' . htmlspecialchars($text, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') . '</p>' .
      '<p style="margin:20px 0">' .
        '<a href="' . htmlspecialchars($ctaHref, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') . '" ' .
           'style="display:inline-block;background:#9e4b13;color:#fff;text-decoration:none;padding:10px 14px;border-radius:12px">' .
           htmlspecialchars($cta, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') .
        '</a>' .
      '</p>' .
      '<div style="margin-top:20px;color:#475569">' .
        '<p>Sincerely,</p>' .
        '<p><strong>Sean</strong><br>DEVOCEAN Lodge<br><em>&#39;You&#39;re Worth It&#39;</em><br>' .
        '<a href="https://devoceanlodge.com" style="color:#9e4b13;text-decoration:none">www.devoceanlodge.com</a></p>' .
      '</div>' .
    '</div>';

  $ack->AltBody =
    $greet . ' ' . $name . ",\n\n" .
    $text . "\n\n" .
    "Book: {$ctaHref}\n" .
    "Sincerely,\nSean\nDEVOCEAN Lodge\n'You're Worth It'\nhttps://devoceanlodge.com";

  // skip role/system addresses
  if (!preg_match('/^(no-?reply|postmaster|mailer-daemon|bounce)/i', $email)) {
    $ack->send();
  }
} catch (\Throwable $e) {
  error_log('Auto-reply failed: ' . $e->getMessage());
  // do not block the user on ack failure
}

/* ---------- done ---------- */
redirect_back(true);
