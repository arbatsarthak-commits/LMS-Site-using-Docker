<?php

require_once __DIR__ . '/util.php';
cors();
require_method('GET');

require_once __DIR__ . '/auth.php';
$user = require_auth('student');

global $conn;

$uid = (int)$user['id'];

$stmt = mysqli_prepare(
  $conn,
  'SELECT p.id, c.name AS course, p.amount, p.status, p.created_at
   FROM payments p
   LEFT JOIN courses c ON c.id = p.course_id
   WHERE p.user_id = ?
   ORDER BY p.id DESC'
);
mysqli_stmt_bind_param($stmt, 'i', $uid);
mysqli_stmt_execute($stmt);
$res = mysqli_stmt_get_result($stmt);

$payments = [];
while ($row = mysqli_fetch_assoc($res)) {
  $payments[] = [
    'id' => (int)$row['id'],
    'course' => $row['course'] ?? '',
    'amount' => (float)$row['amount'],
    'status' => $row['status'] ?? '',
    'createdAt' => $row['created_at'] ?? null,
  ];
}
mysqli_stmt_close($stmt);

json_response(['ok' => true, 'payments' => $payments]);

