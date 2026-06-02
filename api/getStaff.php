<?php

require_once __DIR__ . '/util.php';
cors();
require_method('GET');

require_once __DIR__ . '/auth.php';
require_auth('admin');

global $conn;

$res = mysqli_query(
  $conn,
  'SELECT id, name, role, base_salary, course_assigned, payment_type, created_at FROM staff ORDER BY id DESC',
);
if (!$res) {
  json_response(['ok' => false, 'error' => 'Query failed', 'details' => mysqli_error($conn)], 500);
}

$staff = [];
while ($row = mysqli_fetch_assoc($res)) {
  $staff[] = [
    'id' => (int)$row['id'],
    'name' => $row['name'],
    'role' => $row['role'],
    'baseSalary' => (float)$row['base_salary'],
    'courseAssigned' => $row['course_assigned'] ?? '',
    'paymentType' => $row['payment_type'] ?? 'per_student_incentive',
    'createdAt' => $row['created_at'],
  ];
}

json_response(['ok' => true, 'staff' => $staff]);
