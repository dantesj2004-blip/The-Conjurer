<?php
header('Content-Type: application/json; charset=utf-8');
session_start();

// Compatibilidad con claves de sesión 'user_id' o 'usuario_id'
$usuario_id = null;
if (isset($_SESSION['user_id'])) $usuario_id = $_SESSION['user_id'];
elseif (isset($_SESSION['usuario_id'])) $usuario_id = $_SESSION['usuario_id'];

if (!$usuario_id) {
    http_response_code(401);
    echo json_encode(['error' => 'No autorizado']);
    exit;
}

$conn = new mysqli('localhost', 'root', '', 'the conjurer');
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de conexión']);
    exit;
}

$conn->set_charset('utf8');

// Obtener todos los mazos del usuario (usando prepared statement)
$sql = "SELECT id, nombre, mitologia, mazo_data, fecha_creacion, fecha_actualizacion 
        FROM mazos 
        WHERE usuario_id = ? 
        ORDER BY fecha_actualizacion DESC";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['error' => 'Error en la consulta: ' . $conn->error]);
    exit;
}

$stmt->bind_param('i', $usuario_id);
if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode(['error' => 'Error en la ejecución: ' . $stmt->error]);
    exit;
}

$result = $stmt->get_result();

$mazos = [];
while ($row = $result->fetch_assoc()) {
    $mazo_data = json_decode($row['mazo_data'], true);
    
    // Contar cartas y fuerza total
    $total_cartas = 0;
    $total_fuerza = 0;
    
    if (isset($mazo_data['mazoCards']) && is_array($mazo_data['mazoCards'])) {
        $total_cartas = array_sum($mazo_data['mazoCards']);
        
        // Contar fuerza desde las cartas
        if (isset($mazo_data['cardsDetails']) && is_array($mazo_data['cardsDetails'])) {
            foreach ($mazo_data['cardsDetails'] as $card) {
                if (isset($card['Fuerza'])) {
                    $total_fuerza += (int)$card['Fuerza'] * ($mazo_data['mazoCards'][$card['ID']] ?? 1);
                }
            }
        }
    }
    
    $mazos[] = [
        'id' => (int)$row['id'],
        'nombre' => $row['nombre'],
        'mitologia' => $row['mitologia'],
        'total_cartas' => $total_cartas,
        'total_fuerza' => $total_fuerza,
        'fecha_creacion' => $row['fecha_creacion'],
        'fecha_actualizacion' => $row['fecha_actualizacion'],
        'mazo_data' => $mazo_data
    ];
}

echo json_encode(['mazos' => $mazos], JSON_UNESCAPED_UNICODE);
$stmt->close();
$conn->close();
?>
