<?php
require_once __DIR__ . '/api-bootstrap.php';

$idUsuario = requireAuthenticatedUserId();
$data = getJsonInput();
$idVideojuego = isset($data['idVideojuego']) ? (int) $data['idVideojuego'] : 0;

if ($idVideojuego <= 0) {
    apiResponse(['status' => 'error', 'message' => 'ID de videojuego requerido.'], 400);
}

$conn->begin_transaction();

try {
    $stmt = $conn->prepare('SELECT IdCarrito FROM Carrito WHERE IdUsuario = ?');
    $stmt->bind_param('i', $idUsuario);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        $stmt->close();
        $stmt = $conn->prepare('INSERT INTO Carrito (IdUsuario) VALUES (?)');
        $stmt->bind_param('i', $idUsuario);
        $stmt->execute();
        $idCarrito = $stmt->insert_id;
    } else {
        $row = $result->fetch_assoc();
        $idCarrito = (int) $row['IdCarrito'];
    }
    $stmt->close();

    $stmt = $conn->prepare('INSERT IGNORE INTO Carrito_Videojuego (IdCarrito, IdVideojuego) VALUES (?, ?)');
    $stmt->bind_param('ii', $idCarrito, $idVideojuego);
    $stmt->execute();
    $stmt->close();

    $conn->commit();
    apiResponse(['status' => 'success']);
} catch (Exception $exception) {
    $conn->rollback();
    apiResponse([
        'status' => 'error',
        'message' => $exception->getMessage(),
    ], 500);
}
