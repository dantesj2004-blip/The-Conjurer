<?php
header('Content-Type: application/json; charset=utf-8');
session_start();

// Verificar que sea admin
$usuario_id = null;
if (isset($_SESSION['user_id'])) $usuario_id = $_SESSION['user_id'];
elseif (isset($_SESSION['usuario_id'])) $usuario_id = $_SESSION['usuario_id'];

if (!$usuario_id || !isset($_SESSION['es_admin']) || !$_SESSION['es_admin']) {
    http_response_code(403);
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

// Obtener todos los mazos del usuario admin
$sql = "SELECT id, nombre, mitologia, mazo_data 
        FROM mazos 
        WHERE usuario_id = ? 
        ORDER BY nombre ASC";

$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $usuario_id);
$stmt->execute();
$result = $stmt->get_result();

$mazos = [];
while ($row = $result->fetch_assoc()) {
    $mazo_data = json_decode($row['mazo_data'], true);
    
    // Contar cartas
    $total_cartas = 0;
    if (isset($mazo_data['mazoCards']) && is_array($mazo_data['mazoCards'])) {
        $total_cartas = array_sum($mazo_data['mazoCards']);
    }
    
    // Contar tipos de cartas
    $tipos_cartas = [];
    if (isset($mazo_data['cardsDetails']) && is_array($mazo_data['cardsDetails'])) {
        foreach ($mazo_data['cardsDetails'] as $card) {
            $tipo = $card['Tipo'] ?? 'Desconocido';
            if (!isset($tipos_cartas[$tipo])) {
                $tipos_cartas[$tipo] = 0;
            }
            $tipos_cartas[$tipo] += $mazo_data['mazoCards'][$card['ID']] ?? 1;
        }
    }
    
    $mazos[] = [
        'id' => (int)$row['id'],
        'nombre' => $row['nombre'],
        'mitologia' => $row['mitologia'],
        'total_cartas' => $total_cartas,
        'tipos_cartas' => $tipos_cartas,
        'mazo_data' => $mazo_data
    ];
}

echo json_encode(['mazos' => $mazos], JSON_UNESCAPED_UNICODE);
$stmt->close();
$conn->close();
?>
