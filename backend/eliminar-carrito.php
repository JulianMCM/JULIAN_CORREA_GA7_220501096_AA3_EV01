<?php
require_once __DIR__ . '/api-bootstrap.php';

$idUsuario = requireAuthenticatedUserId();
$data = getJsonInput();
$idVideojuego = isset($data['idVideojuego']) ? (int) $data['idVideojuego'] : 0;

if ($idVideojuego <= 0) {
    apiResponse(['status' => 'error', 'message' => 'ID de videojuego requerido.'], 400);
}

$sql = "DELETE cv FROM Carrito_Videojuego cv
        INNER JOIN Carrito c ON cv.IdCarrito = c.IdCarrito
        WHERE c.IdUsuario = ? AND cv.IdVideojuego = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param('ii', $idUsuario, $idVideojuego);
$stmt->execute();
$stmt->close();

apiResponse(['status' => 'success']);
