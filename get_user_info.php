<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || !isset($_SESSION['nombre_usuario'])) {
    http_response_code(401);
    echo json_encode(['error' => 'No autenticado']);
    exit;
}

try {
    // Conectar a la base de datos
    $servidor = 'localhost';
    $usuario = 'root';
    $contraseña = '';
    $base_datos = 'the conjurer';

    $conexion = new mysqli($servidor, $usuario, $contraseña, $base_datos);

    if ($conexion->connect_error) {
        http_response_code(500);
        echo json_encode(['error' => 'Error de conexión a BD']);
        exit;
    }

    $conexion->set_charset('utf8');

    // Consultar información del usuario
    $stmt = $conexion->prepare('SELECT id, nombre_usuario, email, fecha_registro, ultima_conexion FROM usuarios WHERE id = ?');
    $stmt->bind_param('i', $_SESSION['user_id']);
    $stmt->execute();
    $resultado = $stmt->get_result();

    if ($resultado->num_rows > 0) {
        $usuario = $resultado->fetch_assoc();
        echo json_encode($usuario);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Usuario no encontrado']);
    }

    $stmt->close();
    $conexion->close();

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error: ' . $e->getMessage()]);
}
?>
