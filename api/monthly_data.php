<?php

require_once __DIR__ . '/util.php';
require_once __DIR__ . '/dashboard_helpers.php';

cors();
require_method('GET');

require_once __DIR__ . '/auth.php';
require_auth('admin');

global $conn;

$months = isset($_GET['months']) ? max(3, min(36, (int)$_GET['months'])) : 12;
$series = dash_monthly_registrations($conn, $months);

json_response([
  'ok' => true,
  'series' => $series,
]);
