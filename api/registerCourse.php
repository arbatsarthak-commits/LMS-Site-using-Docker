<?php

require_once __DIR__ . '/util.php';
cors();
require_method('POST');

require_once __DIR__ . '/auth.php';
$user = require_auth('student');

global $conn;

$body = read_json_body();
$courseId = (int)($body['courseId'] ?? 0);
$studentName = trim((string)($body['studentName'] ?? ''));
if ($courseId <= 0) {
  json_response(['ok' => false, 'error' => 'courseId is required'], 400);
}

$uid = (int)$user['id'];

$stmtC = mysqli_prepare($conn, 'SELECT name FROM courses WHERE id = ? LIMIT 1');
mysqli_stmt_bind_param($stmtC, 'i', $courseId);
mysqli_stmt_execute($stmtC);
$resC = mysqli_stmt_get_result($stmtC);
$courseRow = $resC ? mysqli_fetch_assoc($resC) : null;
mysqli_stmt_close($stmtC);
if (!$courseRow) {
  json_response(['ok' => false, 'error' => 'Course not found'], 404);
}
$courseName = (string)$courseRow['name'];

$stmt = mysqli_prepare($conn, 'INSERT IGNORE INTO course_registrations (user_id, course_id) VALUES (?, ?)');
mysqli_stmt_bind_param($stmt, 'ii', $uid, $courseId);
if (!mysqli_stmt_execute($stmt)) {
  $err = mysqli_error($conn);
  mysqli_stmt_close($stmt);
  json_response(['ok' => false, 'error' => 'Registration failed', 'details' => $err], 500);
}
$created = mysqli_stmt_affected_rows($stmt) > 0;
mysqli_stmt_close($stmt);

// Ensure a students row exists for salary logic / admin views.
// (Keeps staff fields empty until admin assigns.)
if ($studentName !== '') {
  $stmtS = mysqli_prepare(
    $conn,
    'INSERT INTO students (user_id, name, course, faculty, front_office, lab_instructor)
     SELECT ?, ?, ?, "", "", ""
     WHERE NOT EXISTS (
       SELECT 1 FROM students WHERE user_id = ? AND course = ? LIMIT 1
     )'
  );
  mysqli_stmt_bind_param($stmtS, 'issis', $uid, $studentName, $courseName, $uid, $courseName);
  mysqli_stmt_execute($stmtS);
  mysqli_stmt_close($stmtS);
}

json_response(['ok' => true, 'registered' => true, 'created' => $created, 'course' => $courseName]);

