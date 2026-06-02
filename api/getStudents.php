<?php

require_once __DIR__ . '/util.php';
cors();
require_method('GET');

require_once __DIR__ . '/auth.php';
require_auth(); // admin + student can view

global $conn;

$result = mysqli_query($conn, 'SELECT id, name, course, faculty, front_office, lab_instructor, created_at FROM students ORDER BY id DESC');
if (!$result) {
  json_response(['ok' => false, 'error' => 'Query failed', 'details' => mysqli_error($conn)], 500);
}

$students = [];
while ($row = mysqli_fetch_assoc($result)) {
  $students[] = [
    'id' => (int)$row['id'],
    'name' => $row['name'],
    'course' => $row['course'],
    'faculty' => $row['faculty'],
    'frontOffice' => $row['front_office'],
    'labInstructor' => $row['lab_instructor'],
    'createdAt' => $row['created_at'],
  ];
}

json_response(['ok' => true, 'students' => $students]);

