<?php
session_start();
header('Content-Type: application/json');

$servidor = 'localhost';
$usuario = 'root';
$contraseña = '';
$base_datos = 'the conjurer';

$conexion = new mysqli($servidor, $usuario, $contraseña, $base_datos);

if ($conexion->connect_error) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error de conexión a la base de datos']);
    exit;
}

$conexion->set_charset('utf8');

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['email']) || !isset($data['password'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Datos incompletos']);
    exit;
}

$email = $data['email'];
$password = $data['password'];

// Hash de la contraseña para comparación
$password_hash = hash('sha256', $password);

// Buscar usuario
$stmt = $conexion->prepare("SELECT id, nombre_usuario, email, es_admin FROM usuarios WHERE email = ? AND contraseña = ?");
$stmt->bind_param("ss", $email, $password_hash);
$stmt->execute();
$resultado = $stmt->get_result();

if ($resultado->num_rows > 0) {
    $usuario = $resultado->fetch_assoc();
    
    // Crear sesión
    $_SESSION['user_id'] = $usuario['id'];
    $_SESSION['nombre_usuario'] = $usuario['nombre_usuario'];
    $_SESSION['email'] = $usuario['email'];
    $_SESSION['es_admin'] = $usuario['es_admin'];
    
    // Actualizar última conexión
    $update_stmt = $conexion->prepare("UPDATE usuarios SET ultima_conexion = NOW() WHERE id = ?");
    $update_stmt->bind_param("i", $usuario['id']);
    $update_stmt->execute();
    $update_stmt->close();
    
    echo json_encode([
        'success' => true,
        'message' => 'Login exitoso',
        'user' => $usuario
    ]);
} else {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Email o contraseña incorrectos']);
}

$stmt->close();
$conexion->close();
?>
