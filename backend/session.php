<?php
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/session-bootstrap.php';
ensureProjectSessionStarted();

if (!isset($_SESSION['usuario'])) {
    echo json_encode(['status' => 'no-session'], JSON_UNESCAPED_UNICODE);
    exit;
}

echo json_encode([
    'status' => 'ok',
    'usuario' => $_SESSION['usuario'],
], JSON_UNESCAPED_UNICODE);
