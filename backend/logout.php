<?php
// backend/logout.php — Cerrar sesión del usuario
session_start();
session_destroy();
header("Location: ../login.html");
exit;
?>