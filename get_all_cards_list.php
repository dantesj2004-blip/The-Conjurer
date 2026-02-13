<?php
header('Content-Type: application/json; charset=utf-8');
session_start();

// Verificar que sea admin - si no, devolver error JSON claro
if (!isset($_SESSION['es_admin']) || !$_SESSION['es_admin']) {
    http_response_code(403);
    echo json_encode(['error' => 'No autorizado', 'authenticated' => isset($_SESSION['usuario_id']), 'is_admin' => $_SESSION['es_admin'] ?? false], JSON_UNESCAPED_UNICODE);
    exit;
}

$conn = new mysqli('localhost', 'root', '', 'the conjurer');
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de conexión a BD', 'details' => $conn->connect_error], JSON_UNESCAPED_UNICODE);
    exit;
}

$conn->set_charset('utf8');

// Obtener todas las cartas de la BD
$sql = "SELECT ID, Nombre, Tipo, Mitologia, Fuerza, Coste, `URL-IMG`, Era 
        FROM cartas 
        ORDER BY Nombre ASC";

$result = $conn->query($sql);

if (!$result) {
    http_response_code(500);
    echo json_encode(['error' => 'Error en query: ' . $conn->error], JSON_UNESCAPED_UNICODE);
    $conn->close();
    exit;
}

$cartas = [];

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        // Asegurar que las rutas de imagen sean completas
        $imagen = $row['URL-IMG'] ?? '';
        if (!empty($imagen) && strpos($imagen, 'http') === false) {
            // Si no comienza con /, agregamos
            if (strpos($imagen, '/') !== 0 && strpos($imagen, 'GDM') !== false) {
                $imagen = '/' . $imagen;
            }
            // Si comienza con /GDM/, agregamos The-Conjurer al inicio
            if (strpos($imagen, '/GDM/') === 0) {
                $imagen = '/The-Conjurer' . $imagen;
            }
        }
        
        $cartas[] = [
            'id' => (int)$row['ID'],
            'nombre' => $row['Nombre'],
            'tipo' => $row['Tipo'],
            'mitologia' => $row['Mitologia'],
            'fuerza' => $row['Fuerza'],
            'coste' => $row['Coste'],
            'imagen' => $imagen,
            'era' => $row['Era']
        ];
    }
}

echo json_encode(['cartas' => $cartas, 'total' => count($cartas)], JSON_UNESCAPED_UNICODE);

$conn->close();
?>
