<?php

require_once __DIR__ . '/util.php';
cors();
require_method('POST');

require_once __DIR__ . '/auth.php';
require_auth('admin');

global $conn;

$body = read_json_body();
$id = (int)($body['id'] ?? 0);
if ($id <= 0) {
  json_response(['status' => 'error', 'ok' => false, 'message' => 'id is required'], 400);
}

mysqli_begin_transaction($conn);
try {
  $stmtS = mysqli_prepare($conn, 'DELETE FROM students WHERE user_id = ?');
  mysqli_stmt_bind_param($stmtS, 'i', $id);
  mysqli_stmt_execute($stmtS);
  mysqli_stmt_close($stmtS);

  $role = 'student';
  $stmtU = mysqli_prepare($conn, 'DELETE FROM users WHERE id = ? AND role = ?');
  mysqli_stmt_bind_param($stmtU, 'is', $id, $role);
  mysqli_stmt_execute($stmtU);
  $affected = mysqli_stmt_affected_rows($stmtU);
  mysqli_stmt_close($stmtU);

  if ($affected <= 0) {
    throw new Exception('Student user not found');
  }

  mysqli_commit($conn);
  json_response(['status' => 'success', 'ok' => true]);
} catch (Exception $e) {
  mysqli_rollback($conn);
  json_response(['status' => 'error', 'ok' => false, 'message' => $e->getMessage()], 400);
}

