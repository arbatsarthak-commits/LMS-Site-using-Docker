<?php

require_once __DIR__ . '/util.php';
require_once __DIR__ . '/dashboard_helpers.php';

cors();
require_method('GET');

require_once __DIR__ . '/auth.php';
require_auth('admin');

global $conn;

$byCourse = dash_revenue_by_course($conn);

json_response([
  'ok' => true,
  'byCourse' => $byCourse,
]);
