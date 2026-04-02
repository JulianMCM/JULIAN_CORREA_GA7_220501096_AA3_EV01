<?php
// test_profile.php — Probar el endpoint de perfil
chdir(__DIR__); // Cambiar al directorio del script

echo "<h1>Probando Endpoint de Perfil</h1>";
echo "<pre>";

// Simular sesión
session_start();
$userId = 1; // Asumir que hay un usuario con ID 1
$_SESSION['id'] = $userId;

echo "Sesión iniciada para usuario ID: $userId\n";

// Simular llamada al perfil
ob_start();
include("backend/perfil.php");
$output = ob_get_clean();

echo "Respuesta del perfil:\n";
echo $output;

echo "\n🎉 Prueba completada!\n";
echo "</pre>";
?>