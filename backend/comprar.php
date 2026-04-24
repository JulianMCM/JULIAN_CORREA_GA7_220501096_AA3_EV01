<?php
require_once __DIR__ . '/api-bootstrap.php';

$idUsuario = requireAuthenticatedUserId();
$data = getJsonInput();
$idVideojuego = isset($data['idVideojuego']) ? (int) $data['idVideojuego'] : (isset($data['id']) ? (int) $data['id'] : 0);
$precio = isset($data['precio']) ? (float) $data['precio'] : null;

if ($idVideojuego <= 0 || $precio === null) {
    apiResponse([
        'status' => 'error',
        'message' => 'Datos incompletos.',
    ], 400);
}

$conn->begin_transaction();

try {
    $stmt = $conn->prepare("INSERT INTO Compra (IdUsuario, MetodoPago, MontoTotal) VALUES (?, 'Tarjeta', ?)");
    $stmt->bind_param('id', $idUsuario, $precio);
    $stmt->execute();
    $idCompra = $stmt->insert_id;
    $stmt->close();

    $stmt = $conn->prepare('INSERT INTO Compra_Videojuego (IdCompra, IdVideojuego) VALUES (?, ?)');
    $stmt->bind_param('ii', $idCompra, $idVideojuego);
    $stmt->execute();
    $stmt->close();

    $stmt = $conn->prepare('SELECT IdBiblioteca FROM Biblioteca WHERE IdUsuario = ?');
    $stmt->bind_param('i', $idUsuario);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        $stmt->close();
        $stmt = $conn->prepare('INSERT INTO Biblioteca (IdUsuario) VALUES (?)');
        $stmt->bind_param('i', $idUsuario);
        $stmt->execute();
        $idBiblioteca = $stmt->insert_id;
    } else {
        $row = $result->fetch_assoc();
        $idBiblioteca = (int) $row['IdBiblioteca'];
    }
    $stmt->close();

    $stmt = $conn->prepare('INSERT IGNORE INTO Biblioteca_Videojuego (IdBiblioteca, IdVideojuego) VALUES (?, ?)');
    $stmt->bind_param('ii', $idBiblioteca, $idVideojuego);
    $stmt->execute();
    $stmt->close();

    $conn->commit();

    apiResponse([
        'status' => 'success',
        'message' => 'Compra realizada correctamente.',
    ]);
} catch (Exception $exception) {
    $conn->rollback();
    apiResponse([
        'status' => 'error',
        'message' => $exception->getMessage(),
    ], 500);
}
