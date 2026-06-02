<?php
/**
 * Institute incentive rules (per student / per assignment on student record).
 * Used by calculate_salary.php and personal_salary.php.
 */
declare(strict_types=1);

function salary_role_label(string $roleKey): string
{
  return match ($roleKey) {
    'front_office' => 'Front Office',
    'lab_instructor' => 'Lab Instructor',
    'teacher' => 'Teacher',
    default => $roleKey,
  };
}

/**
 * @param array<string, array{name: string, role_key: string, role_label: string, totalStudents: int, totalSalary: float}> $buckets
 */
function salary_bucket_add(array &$buckets, string $name, string $roleKey, float $amount, int $studentCount = 1): void
{
  $name = trim($name);
  if ($name === '' || $amount <= 0) {
    return;
  }
  $k = $name . "\0" . $roleKey;
  if (!isset($buckets[$k])) {
    $buckets[$k] = [
      'name' => $name,
      'role_key' => $roleKey,
      'role_label' => salary_role_label($roleKey),
      'totalStudents' => 0,
      'totalSalary' => 0.0,
    ];
  }
  $buckets[$k]['totalSalary'] += $amount;
  $buckets[$k]['totalStudents'] += $studentCount;
}

/**
 * Apply one student row to incentive buckets.
 *
 * Rules:
 * - MSCIT: Front Office ₹80/student, Lab Instructor ₹80/student
 * - Module: Front Office ₹90, Lab Instructor ₹90
 * - DCFA, DCP, DDA, DGDA: ₹400 to Front Office per student
 * - 149: 50% Teacher (₹74.5), 50% Institute (not assigned to staff — omitted)
 * - Other legacy courses: ₹400 Front Office (backward compatible)
 *
 * @param array<string, mixed> $row
 * @param array<string, array{name: string, role_key: string, role_label: string, totalStudents: int, totalSalary: float}> $buckets
 */
function salary_apply_student_row(array $row, array &$buckets): void
{
  $course = trim((string)($row['course'] ?? ''));
  $faculty = trim((string)($row['faculty'] ?? ''));
  $front = trim((string)($row['front_office'] ?? ''));
  $lab = trim((string)($row['lab_instructor'] ?? ''));
  $premiumCourses = ['DCFA', 'DCP', 'DDA', 'DGDA'];

  if ($course === 'MSCIT') {
    salary_bucket_add($buckets, $front, 'front_office', 80.0);
    salary_bucket_add($buckets, $lab, 'lab_instructor', 80.0);
  } elseif ($course === 'Module') {
    salary_bucket_add($buckets, $front, 'front_office', 90.0);
    salary_bucket_add($buckets, $lab, 'lab_instructor', 90.0);
  } elseif ($course === '149') {
    // 50% of ₹149 to teacher; institute share not in staff payroll
    salary_bucket_add($buckets, $faculty, 'teacher', 74.5);
  } elseif (in_array($course, $premiumCourses, true)) {
    salary_bucket_add($buckets, $front, 'front_office', 400.0);
  } else {
    salary_bucket_add($buckets, $front, 'front_office', 400.0);
  }
}

/**
 * @return array{ok: true, buckets: array}|array{ok: false, error: string}
 */
function salary_aggregate_from_students(mysqli $conn, ?string $monthYyyyMm): array
{
  $buckets = [];
  if ($monthYyyyMm !== null && $monthYyyyMm !== '' && preg_match('/^\d{4}-\d{2}$/', $monthYyyyMm)) {
    $stmt = mysqli_prepare(
      $conn,
      "SELECT course, faculty, front_office, lab_instructor, created_at FROM students WHERE DATE_FORMAT(created_at, '%Y-%m') = ?",
    );
    if (!$stmt) {
      return ['ok' => false, 'error' => mysqli_error($conn)];
    }
    mysqli_stmt_bind_param($stmt, 's', $monthYyyyMm);
    if (!mysqli_stmt_execute($stmt)) {
      $err = mysqli_error($conn);
      mysqli_stmt_close($stmt);
      return ['ok' => false, 'error' => $err];
    }
    $result = mysqli_stmt_get_result($stmt);
    mysqli_stmt_close($stmt);
  } else {
    $result = mysqli_query($conn, 'SELECT course, faculty, front_office, lab_instructor, created_at FROM students');
  }

  if (!$result) {
    return ['ok' => false, 'error' => mysqli_error($conn)];
  }

  while ($row = mysqli_fetch_assoc($result)) {
    salary_apply_student_row($row, $buckets);
  }

  return ['ok' => true, 'buckets' => $buckets];
}

/**
 * @param array<string, array{name: string, role_key: string, role_label: string, totalStudents: int, totalSalary: float}> $buckets
 * @return list<array{name: string, role: string, totalStudents: int, totalSalary: float}>
 */
function salary_buckets_to_rows(array $buckets, ?string $roleKeyFilter): array
{
  $rows = [];
  foreach ($buckets as $b) {
    if ($roleKeyFilter !== null && $roleKeyFilter !== '' && $b['role_key'] !== $roleKeyFilter) {
      continue;
    }
    $rows[] = [
      'name' => $b['name'],
      'role' => $b['role_label'],
      'totalStudents' => (int)$b['totalStudents'],
      'totalSalary' => round((float)$b['totalSalary'], 2),
    ];
  }
  usort($rows, static function ($a, $b) {
    return [$b['totalSalary'], $a['name']] <=> [$a['totalSalary'], $b['name']];
  });
  return $rows;
}
