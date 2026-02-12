<?php
// 1. Configuración de errores estricta para que no se cuele ningún texto
ini_set('display_errors', 0);
error_reporting(0); 

// 2. Iniciar buffer de salida para evitar espacios en blanco accidentales
ob_start();

// 3. Headers
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-cache, must-revalidate');

session_start();

// Verificar sesión
$usuario_id = $_SESSION['user_id'] ?? $_SESSION['usuario_id'] ?? null;

if (!$usuario_id) {
    ob_clean(); // Limpiamos cualquier cosa antes de enviar el error
    http_response_code(401);
    echo json_encode(['error' => 'No autorizado']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    ob_clean();
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

// Conectar a BD
$conn = new mysqli('localhost', 'root', '', 'the conjurer');
if ($conn->connect_error) {
    ob_clean();
    http_response_code(500);
    echo json_encode(['error' => 'Error de conexión a BD']);
    exit;
}

$conn->set_charset('utf8');

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['nombre']) || !isset($data['mazoData'])) {
    ob_clean();
    http_response_code(400);
    echo json_encode(['error' => 'Datos incompletos']);
    exit;
}

$usuario_id = (int)$usuario_id;
$nombre = $data['nombre'];
$mitologia = $data['mitologia'] ?? '';
$mazo_data = json_encode($data['mazoData'], JSON_UNESCAPED_UNICODE);
$mazo_id = !empty($data['mazo_id']) ? (int)$data['mazo_id'] : null;

// Limpiamos el buffer justo antes de empezar a enviar las respuestas finales
ob_clean();

if ($mazo_id) {
    // ACTUALIZACIÓN
    $check_stmt = $conn->prepare("SELECT id FROM mazos WHERE id = ? AND usuario_id = ?");
    $check_stmt->bind_param('ii', $mazo_id, $usuario_id);
    $check_stmt->execute();
    if ($check_stmt->get_result()->num_rows === 0) {
        http_response_code(403);
        echo json_encode(['error' => 'No tienes permiso']);
        exit;
    }
    $check_stmt->close();

    $update_stmt = $conn->prepare("UPDATE mazos SET nombre = ?, mitologia = ?, mazo_data = ? WHERE id = ? AND usuario_id = ?");
    $update_stmt->bind_param('sssii', $nombre, $mitologia, $mazo_data, $mazo_id, $usuario_id);
    
    if ($update_stmt->execute()) {
        echo json_encode(['success' => true, 'id' => $mazo_id, 'message' => 'Mazo actualizado'], JSON_UNESCAPED_UNICODE);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Error al actualizar: ' . $update_stmt->error]);
    }
    $update_stmt->close();
} else {
    // NUEVO MAZO
    $insert_stmt = $conn->prepare("INSERT INTO mazos (usuario_id, nombre, mitologia, mazo_data) VALUES (?, ?, ?, ?)");
    $insert_stmt->bind_param('isss', $usuario_id, $nombre, $mitologia, $mazo_data);
    
    if ($insert_stmt->execute()) {
        $mazo_id = $insert_stmt->insert_id;
        $insert_stmt->close();
        
        $insert_rel_stmt = $conn->prepare("INSERT INTO user_mazos (user_id, mazo_id) VALUES (?, ?)");
        $insert_rel_stmt->bind_param('ii', $usuario_id, $mazo_id);

        if ($insert_rel_stmt->execute()) {
             echo json_encode(['success' => true, 'id' => $mazo_id, 'message' => 'Mazo guardado'], JSON_UNESCAPED_UNICODE);
        } else {
             http_response_code(500);
             echo json_encode(['error' => 'Error vinculación: ' . $insert_rel_stmt->error]);
        }
        $insert_rel_stmt->close();
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Error al guardar: ' . $insert_stmt->error]);
    }
}

$conn->close();
exit; // Asegura que no se envíe nada más después
?>