<?php
session_start();
header('Content-Type: application/json');

// Compatibilidad con 'user_id' o 'usuario_id'
$uid = null;
if (isset($_SESSION['user_id'])) $uid = $_SESSION['user_id'];
elseif (isset($_SESSION['usuario_id'])) $uid = $_SESSION['usuario_id'];

if (!$uid) {
    echo json_encode(['logged_in' => false]);
    exit;
}

// Validar que el usuario exista en la base de datos. Si no existe, limpiar sesión.
$servidor = 'localhost';
$usuario = 'root';
$contraseña = '';
$base_datos = 'the conjurer';

$conexion = new mysqli($servidor, $usuario, $contraseña, $base_datos);
if ($conexion->connect_error) {
    // Si no podemos conectar, devolver estado de sesión basado en $_SESSION pero sin exponer datos sensibles
    $nombre = $_SESSION['nombre_usuario'] ?? ($_SESSION['nombre'] ?? null);
    $email = $_SESSION['email'] ?? null;
    $is_admin = $_SESSION['es_admin'] ?? ($_SESSION['admin'] ?? false);

    echo json_encode([
        'logged_in' => true,
        'user_id' => $uid,
        'nombre_usuario' => $nombre,
        'email' => $email,
        'es_admin' => (bool)$is_admin,
        'warning' => 'No se pudo validar usuario en la base de datos'
    ]);
    exit;
}

$conexion->set_charset('utf8');

$stmt = $conexion->prepare('SELECT id, nombre_usuario, email, es_admin FROM usuarios WHERE id = ?');
$stmt->bind_param('i', $uid);
$stmt->execute();
$result = $stmt->get_result();

if ($result && $result->num_rows > 0) {
    $usuarioRow = $result->fetch_assoc();
    echo json_encode([
        'logged_in' => true,
        'user_id' => (int)$usuarioRow['id'],
        'nombre_usuario' => $usuarioRow['nombre_usuario'],
        'email' => $usuarioRow['email'],
        'es_admin' => (bool)$usuarioRow['es_admin']
    ]);
} else {
    // Usuario no existe -> limpiar sesión y cookie
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params['path'], $params['domain'], $params['secure'], $params['httponly']
        );
    }
    session_destroy();
    echo json_encode(['logged_in' => false]);
}

$stmt->close();
$conexion->close();
?>
