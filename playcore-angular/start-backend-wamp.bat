@echo off
setlocal

set "PHP_EXE=C:\wamp64\bin\php\php8.3.28\php.exe"

if not exist "%PHP_EXE%" (
  echo No se encontro PHP de WAMP en "%PHP_EXE%".
  echo Ajusta la variable PHP_EXE dentro de este archivo si tu version de PHP es otra.
  exit /b 1
)

echo Iniciando backend PHP en http://127.0.0.1:8000
"%PHP_EXE%" -S 127.0.0.1:8000 -t ..
