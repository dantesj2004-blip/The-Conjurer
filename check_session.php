<?php
header('Content-Type: application/json; charset=utf-8');
session_start();

// Verificar si hay sesión activa
$usuario_id = null;
if (isset($_SESSION['user_id'])) {
    $usuario_id = $_SESSION['user_id'];
} elseif (isset($_SESSION['usuario_id'])) {
    $usuario_id = $_SESSION['usuario_id'];
}

// Si no hay sesión
if (!$usuario_id) {
    echo json_encode([
        'logged_in' => false,
        'authenticated' => false,
        'es_admin' => false
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Conectar a BD para obtener info completa
$conn = new mysqli('localhost', 'root', '', 'the conjurer');
if ($conn->connect_error) {
    echo json_encode([
        'logged_in' => true,
        'authenticated' => true,
        'es_admin' => isset($_SESSION['es_admin']) && $_SESSION['es_admin'],
        'nombre_usuario' => $_SESSION['nombre_usuario'] ?? 'Usuario',
        'email' => 'error@ejemplo.com'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$conn->set_charset('utf8');

// Obtener datos del usuario
$sql = "SELECT nombre_usuario, email, es_admin FROM usuarios WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $usuario_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    echo json_encode([
        'logged_in' => true,
        'authenticated' => true,
        'es_admin' => (int)$row['es_admin'] === 1,
        'user_id' => $usuario_id,
        'nombre_usuario' => $row['nombre_usuario'],
        'email' => $row['email']
    ], JSON_UNESCAPED_UNICODE);
} else {
    echo json_encode([
        'logged_in' => false,
        'authenticated' => false,
        'es_admin' => false
    ], JSON_UNESCAPED_UNICODE);
}

$stmt->close();
$conn->close();
?>
