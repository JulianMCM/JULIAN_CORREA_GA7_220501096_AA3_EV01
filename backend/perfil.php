<?php
// backend/perfil.php — Obtener datos del perfil del usuario
header('Content-Type: application/json; charset=utf-8');
session_start();
include(__DIR__ . "/../config/db.php");

// Función para manejar errores y devolver JSON
function sendError($message) {
    echo json_encode(["error" => $message]);
    exit;
}

// Verificar si el usuario está logueado
if (!isset($_SESSION['id'])) {
    sendError("No autenticado");
}

$userId = $_SESSION['id'];

try {
    // Obtener información del usuario
    $userSql = "SELECT NombreUsuario, Correo, Pais FROM Usuario WHERE IdUsuario = ?";
    $userStmt = $conn->prepare($userSql);
    if (!$userStmt) {
        sendError("Error preparando consulta de usuario: " . $conn->error);
    }
    $userStmt->bind_param("i", $userId);
    if (!$userStmt->execute()) {
        sendError("Error ejecutando consulta de usuario: " . $userStmt->error);
    }
    $userResult = $userStmt->get_result();
    $user = $userResult->fetch_assoc();
    $userStmt->close();

    if (!$user) {
        sendError("Usuario no encontrado");
    }

    // Obtener videojuegos adquiridos (de la tabla Biblioteca)
    $videojuegosAdquiridos = [];
    $bibliotecaSql = "SELECT v.IdVideojuego, v.Titulo AS nombre, v.Precio, v.Genero, v.FechaLanzamiento, v.ValoracionPromedio, v.Descripcion, bv.FechaAdicion
                      FROM Biblioteca_Videojuego bv
                      INNER JOIN Videojuego v ON bv.IdVideojuego = v.IdVideojuego
                      INNER JOIN Biblioteca b ON bv.IdBiblioteca = b.IdBiblioteca
                      WHERE b.IdUsuario = ?
                      ORDER BY bv.FechaAdicion DESC";
    $biblioStmt = $conn->prepare($bibliotecaSql);
    if ($biblioStmt) {
        $biblioStmt->bind_param("i", $userId);
        if ($biblioStmt->execute()) {
            $biblioResult = $biblioStmt->get_result();
            while ($row = $biblioResult->fetch_assoc()) {
                $videojuegosAdquiridos[] = $row;
            }
        }
        $biblioStmt->close();
    }

    // Obtener lista de deseados
    $deseados = [];
    $deseadoSql = "SELECT v.IdVideojuego, v.Titulo AS nombre, v.Precio, v.Genero, v.FechaLanzamiento, v.ValoracionPromedio, v.Descripcion, d.FechaAgregado
                   FROM Deseado d
                   INNER JOIN Videojuego v ON d.IdVideojuego = v.IdVideojuego
                   WHERE d.IdUsuario = ?
                   ORDER BY d.FechaAgregado DESC";
    $deseadoStmt = $conn->prepare($deseadoSql);
    if ($deseadoStmt) {
        $deseadoStmt->bind_param("i", $userId);
        if ($deseadoStmt->execute()) {
            $deseadoResult = $deseadoStmt->get_result();
            while ($row = $deseadoResult->fetch_assoc()) {
                $deseados[] = $row;
            }
        }
        $deseadoStmt->close();
    }

    // Obtener lista de seguidos
    $seguidos = [];
    $seguidoSql = "SELECT v.IdVideojuego, v.Titulo AS nombre, v.Precio, v.Genero, v.FechaLanzamiento, v.ValoracionPromedio, v.Descripcion, s.FechaAgregado
                   FROM Seguido s
                   INNER JOIN Videojuego v ON s.IdVideojuego = v.IdVideojuego
                   WHERE s.IdUsuario = ?
                   ORDER BY s.FechaAgregado DESC";
    $seguidoStmt = $conn->prepare($seguidoSql);
    if ($seguidoStmt) {
        $seguidoStmt->bind_param("i", $userId);
        if ($seguidoStmt->execute()) {
            $seguidoResult = $seguidoStmt->get_result();
            while ($row = $seguidoResult->fetch_assoc()) {
                $seguidos[] = $row;
            }
        }
        $seguidoStmt->close();
    }

    // Devolver datos del perfil (sin ignorados)
    echo json_encode([
        "usuario" => $user,
        "videojuegosAdquiridos" => $videojuegosAdquiridos,
        "deseados" => $deseados,
        "seguidos" => $seguidos
    ]);

} catch (Exception $e) {
    sendError("Error interno del servidor: " . $e->getMessage());
}

$conn->close();
?>