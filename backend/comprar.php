<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

session_start();
header("Content-Type: application/json");

include("../config/db.php");

// 🔐 Verificar sesión
if (!isset($_SESSION['id'])) {
    echo json_encode([
        "status" => "error",
        "message" => "Usuario no autenticado"
    ]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$idVideojuego = $data['idVideojuego'] ?? null;
$precio = $data['precio'] ?? null;

if (!$idVideojuego || !$precio) {
    echo json_encode([
        "status" => "error",
        "message" => "Datos incompletos"
    ]);
    exit;
}

$idUsuario = $_SESSION['id'];
$idVideojuego = $data['idVideojuego'] ?? $data['id'] ?? null;
$precio = $data['precio'] ?? null;


$conn->begin_transaction();

try {
    // 1. Crear compra
    $stmt = $conn->prepare("INSERT INTO Compra (IdUsuario, MetodoPago, MontoTotal) VALUES (?, 'Tarjeta', ?)");
    $stmt->bind_param("id", $idUsuario, $precio);
    $stmt->execute();

    $idCompra = $stmt->insert_id;

    // 2. Relacionar videojuego
    $stmt = $conn->prepare("INSERT INTO Compra_Videojuego (IdCompra, IdVideojuego) VALUES (?, ?)");
    $stmt->bind_param("ii", $idCompra, $idVideojuego);
    $stmt->execute();

    // 3. Obtener o crear biblioteca
    $stmt = $conn->prepare("SELECT IdBiblioteca FROM Biblioteca WHERE IdUsuario = ?");
    $stmt->bind_param("i", $idUsuario);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        $stmt = $conn->prepare("INSERT INTO Biblioteca (IdUsuario) VALUES (?)");
        $stmt->bind_param("i", $idUsuario);
        $stmt->execute();
        $idBiblioteca = $stmt->insert_id;
    } else {
        $row = $result->fetch_assoc();
        $idBiblioteca = $row['IdBiblioteca'];
    }

    // 4. Insertar en biblioteca
    $stmt = $conn->prepare("INSERT IGNORE INTO Biblioteca_Videojuego (IdBiblioteca, IdVideojuego) VALUES (?, ?)");
    $stmt->bind_param("ii", $idBiblioteca, $idVideojuego);
    $stmt->execute();

    $conn->commit();

    echo json_encode([
        "status" => "success",
        "message" => "Compra realizada correctamente"
    ]);

} catch (Exception $e) {
    $conn->rollback();

    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}