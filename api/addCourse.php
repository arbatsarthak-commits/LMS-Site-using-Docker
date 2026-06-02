<?php

require_once __DIR__ . '/util.php';
cors();
require_method('POST');

require_once __DIR__ . '/auth.php';
require_auth('admin');

global $conn;

$body = read_json_body();
$name = trim((string)($body['name'] ?? ''));
$fee = (float)($body['fee'] ?? 0);

if ($name === '') json_response(['ok' => false, 'error' => 'name is required'], 400);

$stmt = mysqli_prepare($conn, 'INSERT INTO courses (name, fee) VALUES (?, ?)');
mysqli_stmt_bind_param($stmt, 'sd', $name, $fee);
if (!mysqli_stmt_execute($stmt)) {
  $err = mysqli_error($conn);
  mysqli_stmt_close($stmt);
  json_response(['ok' => false, 'error' => 'Insert failed', 'details' => $err], 500);
}
$id = (int)mysqli_insert_id($conn);
mysqli_stmt_close($stmt);

json_response(['ok' => true, 'course' => ['id' => $id, 'name' => $name, 'fee' => $fee]]);

