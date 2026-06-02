<?php

require_once __DIR__ . '/util.php';
cors();
require_method('POST');
ensure_session_started();

require_once __DIR__ . '/db.php';

$body = read_json_body();
$otp = trim((string)($body['otp'] ?? ''));

if ($otp === '') {
  json_response(['status' => 'error', 'message' => 'OTP is required', 'ok' => false], 400);
}

$pending = $_SESSION['pending_login'] ?? null;
if (!$pending || !is_array($pending)) {
  json_response(['status' => 'error', 'message' => 'No OTP session found', 'ok' => false], 401);
}

if ((int)($pending['otp_expires_at'] ?? 0) < time()) {
  unset($_SESSION['pending_login']);
  json_response(['status' => 'error', 'message' => 'OTP expired', 'ok' => false], 401);
}

$attempts = (int)($pending['otp_attempts'] ?? 0);
if ($attempts >= 5) {
  unset($_SESSION['pending_login']);
  json_response(['status' => 'error', 'message' => 'Too many attempts', 'ok' => false], 429);
}

if (!hash_equals((string)$pending['otp'], $otp)) {
  $_SESSION['pending_login']['otp_attempts'] = $attempts + 1;
  json_response(['status' => 'error', 'message' => 'Invalid OTP', 'ok' => false], 401);
}

$id = (int)$pending['user_id'];
$username = (string)$pending['username'];
$role = (string)$pending['role'];

$token = bin2hex(random_bytes(24));
$stmt = mysqli_prepare($conn, 'UPDATE users SET api_token = ? WHERE id = ?');
mysqli_stmt_bind_param($stmt, 'si', $token, $id);
mysqli_stmt_execute($stmt);
mysqli_stmt_close($stmt);

unset($_SESSION['pending_login']);

json_response([
  'status' => 'success',
  'ok' => true,
  'token' => $token,
  'role' => $role,
  'user' => [
    'id' => $id,
    'username' => $username,
    'role' => $role,
  ],
]);

