<?php

require_once __DIR__ . '/util.php';
cors();
require_method('POST');

require_once __DIR__ . '/auth.php';
require_auth('admin');

global $conn;

$body = read_json_body();
$title = trim((string)($body['title'] ?? ''));
$message = trim((string)($body['message'] ?? ''));

if ($message === '') json_response(['ok' => false, 'error' => 'message is required'], 400);

$stmt = mysqli_prepare($conn, 'INSERT INTO notices (title, message) VALUES (?, ?)');
mysqli_stmt_bind_param($stmt, 'ss', $title, $message);
if (!mysqli_stmt_execute($stmt)) {
  $err = mysqli_error($conn);
  mysqli_stmt_close($stmt);
  json_response(['ok' => false, 'error' => 'Insert failed', 'details' => $err], 500);
}
$id = (int)mysqli_insert_id($conn);
mysqli_stmt_close($stmt);

json_response(['ok' => true, 'notice' => ['id' => $id, 'title' => $title, 'message' => $message]]);

