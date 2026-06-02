<?php

require_once __DIR__ . '/util.php';
cors();
require_method('POST');

require_once __DIR__ . '/auth.php';
require_auth('admin');

global $conn;

$body = read_json_body();
$name = trim((string)($body['name'] ?? ''));
$role = trim((string)($body['role'] ?? ''));
$baseSalary = (float)($body['baseSalary'] ?? 0);
$courseAssigned = trim((string)($body['courseAssigned'] ?? ''));
$paymentType = trim((string)($body['paymentType'] ?? 'per_student_incentive'));

if ($name === '' || $role === '') {
  json_response(['ok' => false, 'error' => 'name and role are required'], 400);
}

$allowed = ['teacher', 'front_office', 'lab_instructor'];
if (!in_array($role, $allowed, true)) {
  json_response(['ok' => false, 'error' => 'Invalid role'], 400);
}

$allowedPay = ['per_student_incentive', 'fixed_monthly', 'hybrid'];
if (!in_array($paymentType, $allowedPay, true)) {
  $paymentType = 'per_student_incentive';
}

$stmt = mysqli_prepare(
  $conn,
  'INSERT INTO staff (name, role, base_salary, course_assigned, payment_type) VALUES (?, ?, ?, ?, ?)',
);
mysqli_stmt_bind_param($stmt, 'ssdss', $name, $role, $baseSalary, $courseAssigned, $paymentType);
if (!mysqli_stmt_execute($stmt)) {
  $err = mysqli_error($conn);
  mysqli_stmt_close($stmt);
  json_response(['ok' => false, 'error' => 'Insert failed', 'details' => $err], 500);
}
$id = (int)mysqli_insert_id($conn);
mysqli_stmt_close($stmt);

json_response([
  'ok' => true,
  'staff' => [
    'id' => $id,
    'name' => $name,
    'role' => $role,
    'baseSalary' => $baseSalary,
    'courseAssigned' => $courseAssigned,
    'paymentType' => $paymentType,
  ],
]);
