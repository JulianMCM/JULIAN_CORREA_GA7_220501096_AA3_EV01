<?php
// test_filtro_genero.php — Probar filtro de género
include("config/db.php");

echo "<h1>Probando Filtro de Género</h1>";
echo "<pre>";

// Simular petición con genero=Acción
$_GET['genero'] = 'Acción';

include("backend/videos.php");

echo "\n🎉 Prueba completada!\n";
echo "</pre>";
?>