<?php

function json_response($data, int $status = 200): void {
  http_response_code($status);
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode($data, JSON_UNESCAPED_UNICODE);
  exit;
}

function read_json_body(): array {
  $raw = file_get_contents('php://input');
  if ($raw === false || trim($raw) === '') return [];
  $data = json_decode($raw, true);

  // Some clients accidentally send a JSON-encoded string that contains JSON.
  if (is_string($data)) {
    $data2 = json_decode($data, true);
    if (is_array($data2)) return $data2;
  }

  if (is_array($data)) return $data;

  // Fallback: accept form-encoded POST (useful for quick testing)
  if (!empty($_POST) && is_array($_POST)) return $_POST;

  json_response(['ok' => false, 'error' => 'Invalid JSON body'], 400);
}

function require_method(string $method): void {
  if (($_SERVER['REQUEST_METHOD'] ?? '') !== strtoupper($method)) {
    json_response(['ok' => false, 'error' => 'Method not allowed'], 405);
  }
}

function cors(): void {
  // Dev-friendly CORS for Vite (5173) + direct browser requests.
  header('Access-Control-Allow-Origin: *');
  header('Access-Control-Allow-Headers: Content-Type, Authorization');
  header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
  if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
  }
}

function env_string(string $key, string $default): string {
  $v = getenv($key);
  if ($v === false || $v === '') return $default;
  return $v;
}

function ensure_session_started(): void {
  if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
  }
}

