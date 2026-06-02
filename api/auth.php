<?php

require_once __DIR__ . '/util.php';
require_once __DIR__ . '/db.php';

function get_bearer_token(): ?string {
  $hdr = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
  if (!$hdr && function_exists('getallheaders')) {
    $headers = getallheaders();
    $hdr = $headers['Authorization'] ?? $headers['authorization'] ?? '';
  }
  if (!$hdr) return null;
  if (preg_match('/Bearer\s+(.*)$/i', $hdr, $m)) {
    $t = trim($m[1]);
    return $t !== '' ? $t : null;
  }
  return null;
}

function require_auth(?string $required_role = null): array {
  global $conn;

  $token = get_bearer_token();
  if (!$token) {
    json_response(['ok' => false, 'error' => 'Unauthorized'], 401);
  }

  $stmt = mysqli_prepare($conn, 'SELECT id, username, role FROM users WHERE api_token = ? LIMIT 1');
  mysqli_stmt_bind_param($stmt, 's', $token);
  mysqli_stmt_execute($stmt);
  $res = mysqli_stmt_get_result($stmt);
  $user = $res ? mysqli_fetch_assoc($res) : null;
  mysqli_stmt_close($stmt);

  if (!$user) {
    json_response(['ok' => false, 'error' => 'Invalid token'], 401);
  }

  if ($required_role && ($user['role'] ?? '') !== $required_role) {
    json_response(['ok' => false, 'error' => 'Forbidden'], 403);
  }

  return $user;
}

