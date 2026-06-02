<?php
/**
 * Shared queries for dashboard_stats, monthly_data, revenue_data, dashboard_overview.
 */
declare(strict_types=1);

function dash_month_key(string $ym): string
{
  return $ym;
}

/** @return array{this:int,last:int} */
function dash_student_counts_by_month(mysqli $conn, string $thisYm, string $lastYm): array
{
  $out = ['this' => 0, 'last' => 0];
  $sql = "SELECT DATE_FORMAT(created_at, '%Y-%m') AS ym, COUNT(*) AS c FROM students GROUP BY DATE_FORMAT(created_at, '%Y-%m')";
  $res = mysqli_query($conn, $sql);
  if (!$res) {
    return $out;
  }
  while ($row = mysqli_fetch_assoc($res)) {
    $ym = (string)$row['ym'];
    $c = (int)$row['c'];
    if ($ym === $thisYm) {
      $out['this'] = $c;
    }
    if ($ym === $lastYm) {
      $out['last'] = $c;
    }
  }
  return $out;
}

/** @return array{this:float,last:float} */
function dash_revenue_by_month_pair(mysqli $conn, string $thisYm, string $lastYm): array
{
  $out = ['this' => 0.0, 'last' => 0.0];
  $sql = "SELECT DATE_FORMAT(created_at, '%Y-%m') AS ym, COALESCE(SUM(amount),0) AS total FROM payments GROUP BY DATE_FORMAT(created_at, '%Y-%m')";
  $res = mysqli_query($conn, $sql);
  if (!$res) {
    return $out;
  }
  while ($row = mysqli_fetch_assoc($res)) {
    $ym = (string)$row['ym'];
    $t = (float)$row['total'];
    if ($ym === $thisYm) {
      $out['this'] = $t;
    }
    if ($ym === $lastYm) {
      $out['last'] = $t;
    }
  }
  return $out;
}

function dash_trend_percent(float $curr, float $prev): float
{
  if ($prev <= 0) {
    return $curr > 0 ? 100.0 : 0.0;
  }
  return round((($curr - $prev) / $prev) * 100, 1);
}

/** @return array<string, mixed> */
function dash_build_stats(mysqli $conn): array
{
  $thisYm = date('Y-m');
  $lastYm = date('Y-m', strtotime('first day of last month'));

  $totalStudents = 0;
  $r = mysqli_query($conn, 'SELECT COUNT(*) AS c FROM students');
  if ($r && $row = mysqli_fetch_assoc($r)) {
    $totalStudents = (int)$row['c'];
  }

  $totalRevenue = 0.0;
  $r = mysqli_query($conn, 'SELECT COALESCE(SUM(amount),0) AS s FROM payments');
  if ($r && $row = mysqli_fetch_assoc($r)) {
    $totalRevenue = (float)$row['s'];
  }

  $totalCourses = 0;
  $r = mysqli_query($conn, 'SELECT COUNT(*) AS c FROM courses');
  if ($r && $row = mysqli_fetch_assoc($r)) {
    $totalCourses = (int)$row['c'];
  }

  $totalStaff = 0;
  $r = mysqli_query($conn, 'SELECT COUNT(*) AS c FROM staff');
  if ($r && $row = mysqli_fetch_assoc($r)) {
    $totalStaff = (int)$row['c'];
  }

  $stu = dash_student_counts_by_month($conn, $thisYm, $lastYm);
  $studentTrendPercent = dash_trend_percent((float)$stu['this'], (float)$stu['last']);

  $rev = dash_revenue_by_month_pair($conn, $thisYm, $lastYm);
  $revenueTrendPercent = dash_trend_percent($rev['this'], $rev['last']);

  $monthlyGrowthPercent = $studentTrendPercent;

  return [
    'totalStudents' => $totalStudents,
    'totalRevenue' => round($totalRevenue, 2),
    'totalCourses' => $totalCourses,
    'totalStaff' => $totalStaff,
    'monthlyGrowthPercent' => $monthlyGrowthPercent,
    'studentTrendPercent' => $studentTrendPercent,
    'revenueTrendPercent' => $revenueTrendPercent,
    'currentMonthRegistrations' => $stu['this'],
    'previousMonthRegistrations' => $stu['last'],
    'currentMonthRevenue' => round($rev['this'], 2),
    'previousMonthRevenue' => round($rev['last'], 2),
  ];
}

/** @return list<array{course: string, count: int}> */
function dash_students_per_course(mysqli $conn): array
{
  $out = [];
  $sql = 'SELECT course, COUNT(*) AS c FROM students GROUP BY course ORDER BY c DESC';
  $res = mysqli_query($conn, $sql);
  if (!$res) {
    return $out;
  }
  while ($row = mysqli_fetch_assoc($res)) {
    $out[] = [
      'course' => (string)$row['course'],
      'count' => (int)$row['c'],
    ];
  }
  return $out;
}

/** @return list<array{month: string, count: int}> */
function dash_monthly_registrations(mysqli $conn, int $monthsBack = 12): array
{
  $labels = [];
  for ($i = $monthsBack - 1; $i >= 0; $i--) {
    $labels[] = date('Y-m', strtotime("-$i months"));
  }
  $counts = array_fill_keys($labels, 0);
  $sql = "SELECT DATE_FORMAT(created_at, '%Y-%m') AS ym, COUNT(*) AS c FROM students GROUP BY DATE_FORMAT(created_at, '%Y-%m')";
  $res = mysqli_query($conn, $sql);
  if ($res) {
    while ($row = mysqli_fetch_assoc($res)) {
      $ym = (string)$row['ym'];
      if (isset($counts[$ym])) {
        $counts[$ym] = (int)$row['c'];
      }
    }
  }
  $out = [];
  foreach ($labels as $m) {
    $out[] = ['month' => $m, 'count' => $counts[$m]];
  }
  return $out;
}

/** @return list<array{name: string, value: float}> */
function dash_revenue_by_course(mysqli $conn): array
{
  $out = [];
  $sql = '
    SELECT COALESCE(c.name, \'(Unknown)\') AS course_name, COALESCE(SUM(p.amount), 0) AS total
    FROM payments p
    LEFT JOIN courses c ON c.id = p.course_id
    GROUP BY p.course_id, COALESCE(c.name, \'(Unknown)\')
    ORDER BY total DESC
  ';
  $res = mysqli_query($conn, $sql);
  if (!$res) {
    return $out;
  }
  while ($row = mysqli_fetch_assoc($res)) {
    $v = (float)$row['total'];
    if ($v > 0) {
      $out[] = [
        'name' => (string)$row['course_name'],
        'value' => round($v, 2),
      ];
    }
  }
  return $out;
}

/** @return list<array{type: string, title: string, subtitle: string, at: string|null}> */
function dash_activity_feed(mysqli $conn, int $limit = 20): array
{
  $items = [];

  $q1 = 'SELECT name, course, created_at FROM students ORDER BY created_at DESC LIMIT 15';
  $r = mysqli_query($conn, $q1);
  if ($r) {
    while ($row = mysqli_fetch_assoc($r)) {
      $items[] = [
        'type' => 'student',
        'title' => 'New student: ' . $row['name'],
        'subtitle' => (string)$row['course'],
        'at' => $row['created_at'] ?? null,
      ];
    }
  }

  $q2 = '
    SELECT p.amount, p.created_at, COALESCE(c.name, \'\') AS course
    FROM payments p
    LEFT JOIN courses c ON c.id = p.course_id
    ORDER BY p.created_at DESC
    LIMIT 15
  ';
  $r = mysqli_query($conn, $q2);
  if ($r) {
    while ($row = mysqli_fetch_assoc($r)) {
      $items[] = [
        'type' => 'payment',
        'title' => 'Payment ₹' . number_format((float)$row['amount'], 0, '.', ''),
        'subtitle' => $row['course'] !== '' ? (string)$row['course'] : 'Course payment',
        'at' => $row['created_at'] ?? null,
      ];
    }
  }

  $q3 = '
    SELECT u.username, c.name AS course_name, cr.created_at
    FROM course_registrations cr
    JOIN users u ON u.id = cr.user_id
    JOIN courses c ON c.id = cr.course_id
    ORDER BY cr.created_at DESC
    LIMIT 15
  ';
  $r = mysqli_query($conn, $q3);
  if ($r) {
    while ($row = mysqli_fetch_assoc($r)) {
      $items[] = [
        'type' => 'registration',
        'title' => 'Course registration',
        'subtitle' => ($row['username'] ?? '') . ' → ' . ($row['course_name'] ?? ''),
        'at' => $row['created_at'] ?? null,
      ];
    }
  }

  usort($items, static function ($a, $b) {
    $ta = $a['at'] ? strtotime($a['at']) : 0;
    $tb = $b['at'] ? strtotime($b['at']) : 0;
    return $tb <=> $ta;
  });

  return array_slice($items, 0, $limit);
}
