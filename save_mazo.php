<?php
header('Content-Type: application/json; charset=utf-8');
session_start();

// Verificar sesión (compatibilidad con 'user_id' o 'usuario_id')
$usuario_id = null;
if (isset($_SESSION['user_id'])) $usuario_id = $_SESSION['user_id'];
elseif (isset($_SESSION['usuario_id'])) $usuario_id = $_SESSION['usuario_id'];

if (!$usuario_id) {
    http_response_code(401);
    echo json_encode(['error' => 'No autorizado']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

// Conectar a BD
$conn = new mysqli('localhost', 'root', '', 'the conjurer');
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de conexión a BD']);
    exit;
}

$conn->set_charset('utf8');

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['nombre']) || !isset($data['mazoData'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Datos incompletos']);
    exit;
}

$usuario_id = (int)$usuario_id;
$nombre = $data['nombre'];
$mitologia = $data['mitologia'] ?? '';
$mazo_data = json_encode($data['mazoData'], JSON_UNESCAPED_UNICODE);
$mazo_id = !empty($data['mazo_id']) ? (int)$data['mazo_id'] : null;

// Si viene mazo_id, es una actualización
if ($mazo_id) {
    // Verificar que el mazo pertenece al usuario (usando la columna existente en mazos)
    $check_stmt = $conn->prepare("SELECT id FROM mazos WHERE id = ? AND usuario_id = ?");
    $check_stmt->bind_param('ii', $mazo_id, $usuario_id);
    $check_stmt->execute();
    $check_result = $check_stmt->get_result();
    
    if ($check_result->num_rows === 0) {
        http_response_code(403);
        echo json_encode(['error' => 'No tienes permiso para editar este mazo']);
        $check_stmt->close();
        $conn->close();
        exit;
    }
    $check_stmt->close();
    
    // Actualizar usando prepared statement (mantiene usuario_id en el WHERE)
    $update_stmt = $conn->prepare("UPDATE mazos SET nombre = ?, mitologia = ?, mazo_data = ? 
                                   WHERE id = ? AND usuario_id = ?");
    $update_stmt->bind_param('sssii', $nombre, $mitologia, $mazo_data, $mazo_id, $usuario_id);
    
    if ($update_stmt->execute()) {
        echo json_encode(['success' => true, 'id' => $mazo_id, 'message' => 'Mazo actualizado'], JSON_UNESCAPED_UNICODE);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Error al actualizar: ' . $update_stmt->error]);
    }
    $update_stmt->close();
} else {
    // Es un nuevo mazo: Se inserta en 'mazos' y se crea la relación en 'user_mazos'
    
    // 1. INSERTAR EN LA TABLA MAZOS (Mantiene usuario_id en esta tabla)
    $insert_stmt = $conn->prepare("INSERT INTO mazos (usuario_id, nombre, mitologia, mazo_data) 
                                   VALUES (?, ?, ?, ?)");
    $insert_stmt->bind_param('isss', $usuario_id, $nombre, $mitologia, $mazo_data);
    
    if ($insert_stmt->execute()) {
        $mazo_id = $insert_stmt->insert_id;
        $insert_stmt->close();
        
        // 2. CREAR LA RELACIÓN EN LA TABLA INTERMEDIA (user_mazos)
        $insert_rel_stmt = $conn->prepare("INSERT INTO user_mazos (user_id, mazo_id) VALUES (?, ?)");
        $insert_rel_stmt->bind_param('ii', $usuario_id, $mazo_id);

        if ($insert_rel_stmt->execute()) {
             // Éxito en ambas inserciones
             echo json_encode(['success' => true, 'id' => $mazo_id, 'message' => 'Mazo guardado'], JSON_UNESCAPED_UNICODE);
        } else {
             // Si falla la inserción de la relación. El mazo principal ya existe.
             http_response_code(500);
             echo json_encode(['error' => 'Mazo guardado, pero falló la vinculación de usuario (user_mazos): ' . $insert_rel_stmt->error], JSON_UNESCAPED_UNICODE);
        }
        $insert_rel_stmt->close();
        
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Error al guardar: ' . $insert_stmt->error]);
        $insert_stmt->close(); 
    }
}

$conn->close();
?>
