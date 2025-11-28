<?php
// ARCHIVO TEMPORAL PARA DEPURACIÓN
// Muestra el estado completo de $_SESSION, $_COOKIE y lo que devolvería check_session.php
// ELIMINAR UNA VEZ RESUELTO EL PROBLEMA

session_start();
header('Content-Type: application/json; charset=utf-8');

$resultado = [
    'timestamp' => date('Y-m-d H:i:s'),
    '_SESSION' => $_SESSION,
    '_COOKIE' => $_COOKIE,
    'session_id' => session_id(),
    'session_name' => session_name(),
    'session_status' => session_status() === PHP_SESSION_ACTIVE ? 'ACTIVE' : 'INACTIVE',
    'headers_sent' => headers_sent() ? 'YES' : 'NO',
];

// Simular lo que hace check_session.php
$uid = null;
if (isset($_SESSION['user_id'])) $uid = $_SESSION['user_id'];
elseif (isset($_SESSION['usuario_id'])) $uid = $_SESSION['usuario_id'];

if ($uid) {
    // Intentar conectar a BD
    $servidor = 'localhost';
    $usuario = 'root';
    $contraseña = '';
    $base_datos = 'the conjurer';

    $conexion = new mysqli($servidor, $usuario, $contraseña, $base_datos);
    if (!$conexion->connect_error) {
        $conexion->set_charset('utf8');
        $stmt = $conexion->prepare('SELECT id, nombre_usuario, email, es_admin FROM usuarios WHERE id = ?');
        if ($stmt) {
            $stmt->bind_param('i', $uid);
            $stmt->execute();
            $result = $stmt->get_result();
            if ($result && $result->num_rows > 0) {
                $usuarioRow = $result->fetch_assoc();
                $resultado['usuario_encontrado'] = true;
                $resultado['usuario_bd'] = $usuarioRow;
            } else {
                $resultado['usuario_encontrado'] = false;
                $resultado['usuario_bd'] = null;
            }
            $stmt->close();
        } else {
            $resultado['sql_error'] = $stmt->error;
        }
        $conexion->close();
    } else {
        $resultado['db_connection_error'] = $conexion->connect_error;
    }
}

echo json_encode($resultado, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
?>
