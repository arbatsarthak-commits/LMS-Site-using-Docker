<?php

require_once __DIR__ . '/util.php';
cors();
require_method('POST');

require_once __DIR__ . '/auth.php';
require_auth('admin');

global $conn;

$body = read_json_body();
$id = (int)($body['id'] ?? 0);
$faculty = trim((string)($body['faculty'] ?? ''));
$frontOffice = trim((string)($body['frontOffice'] ?? ''));
$labInstructor = trim((string)($body['labInstructor'] ?? ''));

if ($id <= 0) {
  json_response(['ok' => false, 'error' => 'id is required'], 400);
}

$stmt = mysqli_prepare(
  $conn,
  'UPDATE students SET faculty = ?, front_office = ?, lab_instructor = ? WHERE id = ?'
);
mysqli_stmt_bind_param($stmt, 'sssi', $faculty, $frontOffice, $labInstructor, $id);
if (!mysqli_stmt_execute($stmt)) {
  $err = mysqli_error($conn);
  mysqli_stmt_close($stmt);
  json_response(['ok' => false, 'error' => 'Update failed', 'details' => $err], 500);
}
$affected = mysqli_stmt_affected_rows($stmt);
mysqli_stmt_close($stmt);

json_response(['ok' => true, 'updated' => $affected >= 0]);

