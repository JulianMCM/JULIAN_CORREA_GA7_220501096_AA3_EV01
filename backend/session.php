<?php
session_start();

if (!isset($_SESSION['usuario'])) {
    echo json_encode(["status" => "no-session"]);
} else {
    echo json_encode([
        "status" => "ok",
        "usuario" => $_SESSION['usuario']
    ]);
}
?>