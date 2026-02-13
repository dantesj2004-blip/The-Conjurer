<?php
header('Content-Type: application/json; charset=utf-8');

$noticia_id = $_GET['noticia_id'] ?? null;
if (!$noticia_id) {
    http_response_code(400);
    echo json_encode(['error' => 'noticia_id requerido']);
    exit;
}

$conn = new mysqli('localhost', 'root', '', 'the conjurer');
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de conexión']);
    exit;
}

$conn->set_charset('utf8');

// Crear tabla si no existe
$sql_create = "CREATE TABLE IF NOT EXISTS noticia_referencias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    noticia_id INT NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    referencia_id INT NOT NULL,
    orden INT DEFAULT 0,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (noticia_id) REFERENCES noticias(id) ON DELETE CASCADE,
    UNIQUE KEY unique_ref (noticia_id, tipo, referencia_id)
)";

$conn->query($sql_create);

// Obtener referencias
$sql = "SELECT id, tipo, referencia_id FROM noticia_referencias 
        WHERE noticia_id = ? 
        ORDER BY orden ASC";

$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $noticia_id);
$stmt->execute();
$result = $stmt->get_result();

$referencias = [];
$cartas_ids = [];
$mazos_ids = [];

while ($row = $result->fetch_assoc()) {
    $ref = [
        'id' => (int)$row['id'],
        'tipo' => $row['tipo'],
        'referencia_id' => (int)$row['referencia_id']
    ];
    $referencias[] = $ref;

    if ($row['tipo'] === 'carta') {
        $cartas_ids[] = (int)$row['referencia_id'];
    } elseif ($row['tipo'] === 'mazo') {
        $mazos_ids[] = (int)$row['referencia_id'];
    }
}

// Obtener detalles de cartas
$cartas_data = [];
if (!empty($cartas_ids)) {
    $placeholders = implode(',', array_fill(0, count($cartas_ids), '?'));
    $sql = "SELECT ID, Nombre, Tipo, Mitologia, Fuerza, Coste, `URL-IMG`, Era FROM cartas WHERE ID IN ($placeholders)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param(str_repeat('i', count($cartas_ids)), ...$cartas_ids);
    $stmt->execute();
    $result = $stmt->get_result();

    while ($row = $result->fetch_assoc()) {
        // Asegurar que URL-IMG esté disponible
        $row['Imagen'] = $row['URL-IMG'];
        $cartas_data[$row['ID']] = $row;
    }
}

// Obtener detalles de mazos
$mazos_data = [];
if (!empty($mazos_ids)) {
    $placeholders = implode(',', array_fill(0, count($mazos_ids), '?'));
    $sql = "SELECT id, nombre, mitologia, mazo_data FROM mazos WHERE id IN ($placeholders)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param(str_repeat('i', count($mazos_ids)), ...$mazos_ids);
    $stmt->execute();
    $result = $stmt->get_result();

    while ($row = $result->fetch_assoc()) {
        $mazo_data = json_decode($row['mazo_data'], true);

        // Contar cartas
        $total_cartas = 0;
        $cartas_en_mazo = [];
        if (isset($mazo_data['mazoCards'])) {
            foreach ($mazo_data['mazoCards'] as $cardId => $cantidad) {
                $total_cartas += $cantidad;
                $cartas_en_mazo[$cardId] = $cantidad;
            }
        }

        // Obtener imágenes de todas las cartas del mazo desde la BD
        $card_images = [];
        if (!empty($cartas_en_mazo)) {
            $cardIds = array_keys($cartas_en_mazo);
            $placeholders = implode(',', array_fill(0, count($cardIds), '?'));
            $sql_imgs = "SELECT ID, `URL-IMG` FROM cartas WHERE ID IN ($placeholders)";
            $stmt_imgs = $conn->prepare($sql_imgs);
            if ($stmt_imgs) {
                $stmt_imgs->bind_param(str_repeat('i', count($cardIds)), ...$cardIds);
                $stmt_imgs->execute();
                $result_imgs = $stmt_imgs->get_result();
                while ($img_row = $result_imgs->fetch_assoc()) {
                    $card_images[$img_row['ID']] = $img_row['URL-IMG'];
                }
                $stmt_imgs->close();
            }
        }
        
        // Obtener detalles de cartas del mazo
        $cartas_del_mazo = [];
        if (isset($mazo_data['cardsDetails'])) {
            foreach ($mazo_data['cardsDetails'] as $card) {
                $cardId = $card['ID'];
                if (isset($cartas_en_mazo[$cardId])) {
                    $imagen = $card_images[$cardId] ?? $card['Imagen'] ?? $card['URL-IMG'] ?? null;
                    $cartas_del_mazo[] = [
                        'id' => $cardId,
                        'nombre' => $card['Nombre'],
                        'tipo' => $card['Tipo'],
                        'mitologia' => $card['Mitologia'],
                        'imagen' => $imagen,
                        'cantidad' => $cartas_en_mazo[$cardId]
                    ];
                }
            }
        }

        // Contar tipos
        $tipos_cartas = [];
        if (isset($mazo_data['cardsDetails'])) {
            foreach ($mazo_data['cardsDetails'] as $card) {
                $tipo = $card['Tipo'] ?? 'Desconocido';
                if (!isset($tipos_cartas[$tipo])) {
                    $tipos_cartas[$tipo] = 0;
                }
                $tipos_cartas[$tipo] += $mazo_data['mazoCards'][$card['ID']] ?? 1;
            }
        }

        $mazos_data[$row['id']] = [
            'id' => (int)$row['id'],
            'nombre' => $row['nombre'],
            'mitologia' => $row['mitologia'],
            'total_cartas' => $total_cartas,
            'tipos_cartas' => $tipos_cartas,
            'cartas' => $cartas_del_mazo,
            'mazo_data_json' => $row['mazo_data']
        ];
    }
}

echo json_encode([
    'referencias' => $referencias,
    'cartas' => $cartas_data,
    'mazos' => $mazos_data
], JSON_UNESCAPED_UNICODE);

$stmt->close();
$conn->close();
?>
