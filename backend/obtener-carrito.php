<?php
require_once __DIR__ . '/api-bootstrap.php';

$idUsuario = requireAuthenticatedUserId();

$sql = "SELECT v.IdVideojuego, v.Titulo AS nombre, v.Precio
        FROM Carrito c
        INNER JOIN Carrito_Videojuego cv ON c.IdCarrito = cv.IdCarrito
        INNER JOIN Videojuego v ON cv.IdVideojuego = v.IdVideojuego
        WHERE c.IdUsuario = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $idUsuario);
$stmt->execute();
$result = $stmt->get_result();

$juegos = [];
while ($row = $result->fetch_assoc()) {
    $juegos[] = $row;
}

$stmt->close();

echo json_encode($juegos, JSON_UNESCAPED_UNICODE);
