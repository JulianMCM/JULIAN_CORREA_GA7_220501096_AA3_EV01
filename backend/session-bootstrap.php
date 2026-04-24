<?php
function ensureProjectSessionStarted(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    $sessionDir = __DIR__ . '/../storage/sessions';

    if (!is_dir($sessionDir)) {
        mkdir($sessionDir, 0777, true);
    }

    session_save_path($sessionDir);
    session_start();
}
