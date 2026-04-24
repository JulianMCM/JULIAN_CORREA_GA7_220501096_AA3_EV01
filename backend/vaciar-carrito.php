<?php
require_once __DIR__ . '/api-bootstrap.php';

$idUsuario = requireAuthenticatedUserId();

$sql = "DELETE cv FROM Carrito_Videojuego cv
        INNER JOIN Carrito c ON cv.IdCarrito = c.IdCarrito
        WHERE c.IdUsuario = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $idUsuario);
$stmt->execute();
$stmt->close();

apiResponse(['status' => 'success']);
