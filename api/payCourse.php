<?php

require_once __DIR__ . '/util.php';
cors();
require_method('POST');

require_once __DIR__ . '/auth.php';
$user = require_auth('student');

global $conn;

$body = read_json_body();
$courseId = (int)($body['courseId'] ?? 0);
$amount = (float)($body['amount'] ?? 0);

if ($courseId <= 0 || $amount <= 0) {
  json_response(['ok' => false, 'error' => 'courseId and amount are required'], 400);
}

$uid = (int)$user['id'];

// Ensure registration exists
$stmtR = mysqli_prepare($conn, 'INSERT IGNORE INTO course_registrations (user_id, course_id) VALUES (?, ?)');
mysqli_stmt_bind_param($stmtR, 'ii', $uid, $courseId);
mysqli_stmt_execute($stmtR);
mysqli_stmt_close($stmtR);

$status = 'paid';
$stmt = mysqli_prepare($conn, 'INSERT INTO payments (user_id, course_id, amount, status) VALUES (?, ?, ?, ?)');
mysqli_stmt_bind_param($stmt, 'iids', $uid, $courseId, $amount, $status);
if (!mysqli_stmt_execute($stmt)) {
  $err = mysqli_error($conn);
  mysqli_stmt_close($stmt);
  json_response(['ok' => false, 'error' => 'Payment failed', 'details' => $err], 500);
}
$paymentId = (int)mysqli_insert_id($conn);
mysqli_stmt_close($stmt);

json_response(['ok' => true, 'payment' => ['id' => $paymentId, 'courseId' => $courseId, 'amount' => $amount]]);

