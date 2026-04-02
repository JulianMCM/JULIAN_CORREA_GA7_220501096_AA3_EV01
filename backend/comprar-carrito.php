<?php
header("Content-Type: application/json");
session_start();
include("../config/db.php");

if (!isset($_SESSION['id'])) {
    echo json_encode(["status" => "error", "message" => "No autenticado"]);
    exit;
}

$idUsuario = $_SESSION['id'];

$conn->begin_transaction();

try {

    // 1. Obtener carrito
    $sql = "SELECT v.IdVideojuego, v.Precio
        FROM Carrito c
        INNER JOIN Carrito_Videojuego cv ON c.IdCarrito = cv.IdCarrito
        INNER JOIN Videojuego v ON cv.IdVideojuego = v.IdVideojuego
        WHERE c.IdUsuario = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $idUsuario);
    $stmt->execute();
    $result = $stmt->get_result();

    $juegos = [];
    $total = 0;

    while ($row = $result->fetch_assoc()) {
        $juegos[] = $row;
        $total += $row['Precio'];
    }

    if (count($juegos) === 0) {
        throw new Exception("El carrito está vacío");
    }

    // 2. Crear compra
    $stmt = $conn->prepare("INSERT INTO Compra (IdUsuario, MetodoPago, MontoTotal) VALUES (?, 'Carrito', ?)");
    $stmt->bind_param("id", $idUsuario, $total);
    $stmt->execute();

    $idCompra = $stmt->insert_id;

    // 3. Obtener o crear biblioteca
    $stmt = $conn->prepare("SELECT IdBiblioteca FROM Biblioteca WHERE IdUsuario = ?");
    $stmt->bind_param("i", $idUsuario);
    $stmt->execute();
    $res = $stmt->get_result();

    if ($res->num_rows === 0) {
        $stmt = $conn->prepare("INSERT INTO Biblioteca (IdUsuario) VALUES (?)");
        $stmt->bind_param("i", $idUsuario);
        $stmt->execute();
        $idBiblioteca = $stmt->insert_id;
    } else {
        $row = $res->fetch_assoc();
        $idBiblioteca = $row['IdBiblioteca'];
    }

    // 4. Insertar cada juego
    foreach ($juegos as $juego) {

        // Compra_Videojuego
        $stmt = $conn->prepare("INSERT INTO Compra_Videojuego (IdCompra, IdVideojuego) VALUES (?, ?)");
        $stmt->bind_param("ii", $idCompra, $juego['IdVideojuego']);
        $stmt->execute();

        // Biblioteca (evita duplicados)
        $stmt = $conn->prepare("INSERT IGNORE INTO Biblioteca_Videojuego (IdBiblioteca, IdVideojuego) VALUES (?, ?)");
        $stmt->bind_param("ii", $idBiblioteca, $juego['IdVideojuego']);
        $stmt->execute();
    }

    // 5. Vaciar carrito
    $stmt = $conn->prepare("DELETE FROM Carrito WHERE IdUsuario = ?");
    $stmt->bind_param("i", $idUsuario);
    $stmt->execute();

    $conn->commit();

    echo json_encode([
        "status" => "success",
        "message" => "Compra realizada con éxito"
    ]);

} catch (Exception $e) {

    $conn->rollback();

    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}