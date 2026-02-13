<?php
header('Content-Type: application/json; charset=utf-8');
session_start();

$servidor = 'localhost';
$usuario = 'root';
$contraseña = '';
$base_datos = 'the conjurer';

$conexion = new mysqli($servidor, $usuario, $contraseña, $base_datos);

if ($conexion->connect_error) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error de conexión']);
    exit;
}

$conexion->set_charset('utf8');

$result = $conexion->query("SELECT id, nombre_usuario, email, es_admin, fecha_registro, ultima_conexion FROM usuarios ORDER BY fecha_registro DESC");

if (!$result) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $conexion->error]);
    exit;
}

$usuarios = [];
while ($row = $result->fetch_assoc()) {
    $usuarios[] = $row;
}

echo json_encode($usuarios);

$conexion->close();
?>
