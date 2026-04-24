<?php
require_once __DIR__ . '/api-bootstrap.php';

$idUsuario = requireAuthenticatedUserId();

$conn->begin_transaction();

try {
    $sql = "SELECT v.IdVideojuego, v.Precio
            FROM Carrito c
            INNER JOIN Carrito_Videojuego cv ON c.IdCarrito = cv.IdCarrito
            INNER JOIN Videojuego v ON cv.IdVideojuego = v.IdVideojuego
            WHERE c.IdUsuario = ?";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $idUsuario);
    $stmt->execute();
    $result = $stmt->get_result();

    $juegos = [];
    $total = 0;

    while ($row = $result->fetch_assoc()) {
        $juegos[] = $row;
        $total += (float) $row['Precio'];
    }
    $stmt->close();

    if (count($juegos) === 0) {
        throw new Exception('El carrito está vacío');
    }

    $stmt = $conn->prepare("INSERT INTO Compra (IdUsuario, MetodoPago, MontoTotal) VALUES (?, 'Carrito', ?)");
    $stmt->bind_param('id', $idUsuario, $total);
    $stmt->execute();
    $idCompra = $stmt->insert_id;
    $stmt->close();

    $stmt = $conn->prepare('SELECT IdBiblioteca FROM Biblioteca WHERE IdUsuario = ?');
    $stmt->bind_param('i', $idUsuario);
    $stmt->execute();
    $res = $stmt->get_result();

    if ($res->num_rows === 0) {
        $stmt->close();
        $stmt = $conn->prepare('INSERT INTO Biblioteca (IdUsuario) VALUES (?)');
        $stmt->bind_param('i', $idUsuario);
        $stmt->execute();
        $idBiblioteca = $stmt->insert_id;
    } else {
        $row = $res->fetch_assoc();
        $idBiblioteca = (int) $row['IdBiblioteca'];
    }
    $stmt->close();

    foreach ($juegos as $juego) {
        $stmt = $conn->prepare('INSERT INTO Compra_Videojuego (IdCompra, IdVideojuego) VALUES (?, ?)');
        $stmt->bind_param('ii', $idCompra, $juego['IdVideojuego']);
        $stmt->execute();
        $stmt->close();

        $stmt = $conn->prepare('INSERT IGNORE INTO Biblioteca_Videojuego (IdBiblioteca, IdVideojuego) VALUES (?, ?)');
        $stmt->bind_param('ii', $idBiblioteca, $juego['IdVideojuego']);
        $stmt->execute();
        $stmt->close();
    }

    $stmt = $conn->prepare("DELETE cv FROM Carrito_Videojuego cv
                            INNER JOIN Carrito c ON cv.IdCarrito = c.IdCarrito
                            WHERE c.IdUsuario = ?");
    $stmt->bind_param('i', $idUsuario);
    $stmt->execute();
    $stmt->close();

    $conn->commit();

    apiResponse([
        'status' => 'success',
        'message' => 'Compra realizada con éxito',
    ]);
} catch (Exception $exception) {
    $conn->rollback();

    apiResponse([
        'status' => 'error',
        'message' => $exception->getMessage(),
    ], 500);
}
