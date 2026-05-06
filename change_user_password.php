<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/config.php';

if (!isset($_SESSION['es_admin']) || !$_SESSION['es_admin']) {
    http_response_code(403);
    echo json_encode([
        'success' => false,
        'error' => 'No autorizado'
    ]);
    exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!is_array($data)) {
    $data = $_POST;
}

$usuario_id = 0;

if (isset($data['usuario_id'])) {
    $usuario_id = (int)$data['usuario_id'];
} elseif (isset($data['id'])) {
    $usuario_id = (int)$data['id'];
} elseif (isset($data['user_id'])) {
    $usuario_id = (int)$data['user_id'];
}

$nueva_password = '';

if (isset($data['nueva_password'])) {
    $nueva_password = trim($data['nueva_password']);
} elseif (isset($data['password'])) {
    $nueva_password = trim($data['password']);
} elseif (isset($data['new_password'])) {
    $nueva_password = trim($data['new_password']);
}

if ($usuario_id <= 0) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'ID de usuario no válido'
    ]);
    exit;
}

if ($nueva_password === '') {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'La nueva contraseña está vacía'
    ]);
    exit;
}

$hashed_password = password_hash($nueva_password, PASSWORD_DEFAULT);

$stmt = $conexion->prepare("UPDATE usuarios SET `contraseña` = ? WHERE id = ?");

if (!$stmt) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error SQL prepare: ' . $conexion->error
    ]);
    exit;
}

$stmt->bind_param('si', $hashed_password, $usuario_id);

if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error al actualizar contraseña: ' . $stmt->error
    ]);
    $stmt->close();
    $conexion->close();
    exit;
}

if ($stmt->affected_rows < 1) {
    http_response_code(404);
    echo json_encode([
        'success' => false,
        'error' => 'No se actualizó ningún usuario. Revisa que el ID exista.'
    ]);
    $stmt->close();
    $conexion->close();
    exit;
}

echo json_encode([
    'success' => true,
    'message' => 'Contraseña actualizada correctamente'
]);

$stmt->close();
$conexion->close();
?>