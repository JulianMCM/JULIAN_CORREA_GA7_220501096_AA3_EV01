<?php
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/session-bootstrap.php';
ensureProjectSessionStarted();

require_once __DIR__ . '/../config/db.php';

function apiResponse(array $payload, int $statusCode = 200)
{
    http_response_code($statusCode);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function getJsonInput(): array
{
    $rawInput = file_get_contents('php://input');

    if ($rawInput === false || trim($rawInput) === '') {
        return [];
    }

    $data = json_decode($rawInput, true);

    if (!is_array($data)) {
        apiResponse([
            'status' => 'error',
            'message' => 'El cuerpo de la petición no es JSON válido.',
        ], 400);
    }

    return $data;
}

function requireAuthenticatedUserId(): int
{
    if (!isset($_SESSION['id'])) {
        apiResponse([
            'status' => 'error',
            'message' => 'No autenticado',
        ], 401);
    }

    return (int) $_SESSION['id'];
}
