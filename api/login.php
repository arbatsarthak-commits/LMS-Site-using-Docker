<?php

require_once __DIR__ . '/util.php';
cors();
require_method('POST');
ensure_session_started();

require_once __DIR__ . '/db.php';

$body = read_json_body();
$username = trim((string)($body['username'] ?? ''));
$password = (string)($body['password'] ?? '');
$requestedRole = trim((string)($body['role'] ?? '')); // optional
$captchaAnswer = trim((string)($body['captchaAnswer'] ?? ''));

if ($username === '' || $password === '') {
  json_response(['status' => 'error', 'message' => 'Username and password required', 'ok' => false], 400);
}

$captcha = $_SESSION['captcha'] ?? null;
if (!$captcha || !is_array($captcha)) {
  json_response(['status' => 'error', 'message' => 'Captcha required', 'ok' => false], 400);
}
if ((int)($captcha['expires_at'] ?? 0) < time()) {
  unset($_SESSION['captcha']);
  json_response(['status' => 'error', 'message' => 'Captcha expired', 'ok' => false], 400);
}
if ($captchaAnswer === '' || !hash_equals((string)$captcha['answer'], $captchaAnswer)) {
  json_response(['status' => 'error', 'message' => 'Invalid Captcha', 'ok' => false], 400);
}
unset($_SESSION['captcha']);

$stmt = mysqli_prepare($conn, 'SELECT id, username, password_hash, password, role FROM users WHERE username = ? LIMIT 1');
mysqli_stmt_bind_param($stmt, 's', $username);
mysqli_stmt_execute($stmt);
$res = mysqli_stmt_get_result($stmt);
$row = $res ? mysqli_fetch_assoc($res) : null;
mysqli_stmt_close($stmt);

if (!$row) {
  json_response(['status' => 'error', 'message' => 'Invalid credentials', 'ok' => false], 401);
}

$hash = (string)($row['password_hash'] ?? '');
$plain = (string)($row['password'] ?? '');
$passwordOk = ($hash !== '' && password_verify($password, $hash)) || ($plain !== '' && hash_equals($plain, $password));
if (!$passwordOk) {
  json_response(['status' => 'error', 'message' => 'Invalid credentials', 'ok' => false], 401);
}

$role = (string)($row['role'] ?? '');
if ($requestedRole !== '' && $requestedRole !== $role) {
  json_response(['status' => 'error', 'message' => 'Invalid credentials', 'ok' => false], 401);
}

$id = (int)$row['id'];

// Admin requires OTP verification before final login.
if ($role === 'admin') {
  $otp = (string)random_int(100000, 999999);
  $_SESSION['pending_login'] = [
    'user_id' => $id,
    'username' => (string)$row['username'],
    'role' => $role,
    'otp' => $otp,
    'otp_expires_at' => time() + 300,
    'otp_attempts' => 0,
  ];
  json_response([
    'status' => 'otp_required',
    'ok' => true,
    'role' => 'admin',
    // Simulated OTP for development/testing (Option A).
    'otp' => $otp,
    'message' => 'OTP generated for admin login',
  ]);
}

$token = bin2hex(random_bytes(24));
$stmt2 = mysqli_prepare($conn, 'UPDATE users SET api_token = ? WHERE id = ?');
mysqli_stmt_bind_param($stmt2, 'si', $token, $id);
mysqli_stmt_execute($stmt2);
mysqli_stmt_close($stmt2);

json_response([
  'status' => 'success',
  'ok' => true,
  'token' => $token,
  'role' => $role,
  'user' => [
    'id' => $id,
    'username' => $row['username'],
    'role' => $role,
  ],
]);

