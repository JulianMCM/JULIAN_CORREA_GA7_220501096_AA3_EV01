<?php
session_start();
include("../config/db.php");

header("Content-Type: application/json");

// Verificar sesión
if (!isset($_SESSION['id'])) {
    echo json_encode(["enBiblioteca" => false]);
    exit;
}

$idUsuario = $_SESSION['id'];
$idVideojuego = $_GET['idVideojuego'] ?? null;

if (!$idVideojuego) {
    echo json_encode(["enBiblioteca" => false]);
    exit;
}

// Consultar si el juego está en biblioteca
$sql = "SELECT bv.IdVideojuego
        FROM Biblioteca_Videojuego bv
        INNER JOIN Biblioteca b ON bv.IdBiblioteca = b.IdBiblioteca
        WHERE b.IdUsuario = ? AND bv.IdVideojuego = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $idUsuario, $idVideojuego);
$stmt->execute();
$result = $stmt->get_result();

echo json_encode([
    "enBiblioteca" => $result->num_rows > 0
]);