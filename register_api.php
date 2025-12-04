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
    echo json_encode(['success' => false, 'error' => 'Error de conexión']);
    exit;
}

$conexion->set_charset('utf8');

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['nombre_usuario']) || !isset($data['email']) || !isset($data['password']) || !isset($data['password_confirmation'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Datos incompletos']);
    exit;
}

$nombre_usuario = $data['nombre_usuario'];
$email = $data['email'];
$password = $data['password'];
$password_confirmation = $data['password_confirmation']; // Usamos esta variable

// --- INICIO DE VALIDACIONES ADICIONALES DEL SERVIDOR ---

// 1. VALIDACIÓN DE COINCIDENCIA DE CONTRASEÑAS (Ya existía, pero la reestructuramos)
if ($password !== $password_confirmation) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Las contraseñas no coinciden.']);
    exit;
}

// 2. VALIDACIÓN DE FORMATO DE EMAIL (NUEVO)
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'El formato del email no es válido.']);
    exit;
}

// 3. VALIDACIÓN DE LONGITUD DE CONTRASEÑA (NUEVO)
if (strlen($password) < 8) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'La contraseña debe tener al menos 8 caracteres.']);
    exit;
}

// 4. VALIDACIÓN DE LONGITUD DE NOMBRE DE USUARIO (Mantenemos tu validación)
if (strlen($nombre_usuario) < 3) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'El nombre de usuario debe tener al menos 3 caracteres.']);
    exit;
}
// --- FIN DE VALIDACIONES ADICIONALES DEL SERVIDOR ---

// Hash de la contraseña.
// Nota: Usas SHA256, que es aceptable pero se recomienda 'password_hash' (PASSWORD_DEFAULT) para mayor seguridad.
$password_hash = hash('sha256', $password);

// 5. VALIDACIÓN DE UNICIDAD (Ya existía)
$check_stmt = $conexion->prepare("SELECT id FROM usuarios WHERE nombre_usuario = ? OR email = ?");
$check_stmt->bind_param("ss", $nombre_usuario, $email);
$check_stmt->execute();
$check_resultado = $check_stmt->get_result();

if ($check_resultado->num_rows > 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'El usuario o email ya está registrado.']);
    $check_stmt->close();
    $conexion->close();
    exit;
}
$check_stmt->close();

// Insertar nuevo usuario
$insert_stmt = $conexion->prepare("INSERT INTO usuarios (nombre_usuario, email, contraseña, es_admin) VALUES (?, ?, ?, FALSE)");
$insert_stmt->bind_param("sss", $nombre_usuario, $email, $password_hash);

if ($insert_stmt->execute()) {
    $user_id = $insert_stmt->insert_id;
    
    // Crear sesión automáticamente después del registro
    $_SESSION['user_id'] = $user_id;
    $_SESSION['nombre_usuario'] = $nombre_usuario;
    $_SESSION['email'] = $email;
    $_SESSION['es_admin'] = false;
    
    echo json_encode([
        'success' => true,
        'message' => 'Registro exitoso',
        'user' => [
            'id' => $user_id,
            'nombre_usuario' => $nombre_usuario,
            'email' => $email
        ]
    ]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error al registrar: ' . $insert_stmt->error]);
}

$insert_stmt->close();
$conexion->close();
?>