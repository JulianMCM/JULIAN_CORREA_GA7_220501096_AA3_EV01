<?php
$host = "127.0.0.1";
$user = "root";
$password = "root";
$db = "PlayCoreDB";
$port = 3308;

$conn = new mysqli($host, $user, $password, $db, $port);

if ($conn->connect_error) {
    die("Error de conexión: " . $conn->connect_error);
}
?>