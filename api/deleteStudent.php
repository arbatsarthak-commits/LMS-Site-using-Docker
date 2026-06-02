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
  json_response(['ok' => false, 'error' => 'Student id is required'], 400);
}

$stmt = mysqli_prepare($conn, 'DELETE FROM students WHERE id = ?');
mysqli_stmt_bind_param($stmt, 'i', $id);
if (!mysqli_stmt_execute($stmt)) {
  $err = mysqli_error($conn);
  mysqli_stmt_close($stmt);
  json_response(['ok' => false, 'error' => 'Delete failed', 'details' => $err], 500);
}
$affected = mysqli_stmt_affected_rows($stmt);
mysqli_stmt_close($stmt);

json_response(['ok' => true, 'deleted' => $affected > 0]);

