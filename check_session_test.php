<?php
// ENDPOINT TEMPORAL PARA VER EXACTAMENTE QUÉ DEVUELVE check_session.php
session_start();
header('Content-Type: application/json; charset=utf-8');

// Incluir la lógica de check_session.php
$uid = null;
if (isset($_SESSION['user_id'])) $uid = $_SESSION['user_id'];
elseif (isset($_SESSION['usuario_id'])) $uid = $_SESSION['usuario_id'];

if (!$uid) {
    echo json_encode(['logged_in' => false, 'debug' => '$uid es nulo']);
    exit;
}

$servidor = 'localhost';
$usuario = 'root';
$contraseña = '';
$base_datos = 'the conjurer';

$conexion = new mysqli($servidor, $usuario, $contraseña, $base_datos);
if ($conexion->connect_error) {
    echo json_encode([
        'error' => 'Conexión fallida',
        'message' => $conexion->connect_error,
        'session_data' => $_SESSION
    ]);
    exit;
}

$conexion->set_charset('utf8');

$stmt = $conexion->prepare('SELECT id, nombre_usuario, email, es_admin FROM usuarios WHERE id = ?');
if (!$stmt) {
    echo json_encode(['error' => 'Prepare falló: ' . $conexion->error]);
    exit;
}

$stmt->bind_param('i', $uid);
if (!$stmt->execute()) {
    echo json_encode(['error' => 'Execute falló: ' . $stmt->error]);
    exit;
}

$result = $stmt->get_result();

if ($result && $result->num_rows > 0) {
    $usuarioRow = $result->fetch_assoc();
    echo json_encode([
        'logged_in' => true,
        'user_id' => (int)$usuarioRow['id'],
        'nombre_usuario' => $usuarioRow['nombre_usuario'],
        'email' => $usuarioRow['email'],
        'es_admin' => (bool)$usuarioRow['es_admin'],
        'debug' => 'Usuario encontrado correctamente en BD'
    ], JSON_UNESCAPED_UNICODE);
} else {
    echo json_encode([
        'logged_in' => false,
        'debug' => 'Usuario NO encontrado en BD',
        'uid_buscado' => $uid,
        'resultado_num_rows' => $result ? $result->num_rows : 'null'
    ]);
}

$stmt->close();
$conexion->close();
?>
