<?php
header('Content-Type: application/json; charset=utf-8');

$raw = file_get_contents('php://input');
if (!$raw) {
    http_response_code(400);
    echo json_encode(['success'=>false,'error'=>'No JSON body received'], JSON_UNESCAPED_UNICODE);
    exit;
}

$data = json_decode($raw, true);
if (!$data) {
    http_response_code(400);
    echo json_encode(['success'=>false,'error'=>'JSON inválido'], JSON_UNESCAPED_UNICODE);
    exit;
}

// Validación mínima
$nombre = isset($data['Nombre']) ? $data['Nombre'] : null;
$tipo = isset($data['Tipo']) ? $data['Tipo'] : (isset($data['TipoSelect']) ? $data['TipoSelect'] : null);
if (!$nombre || !$tipo) {
    http_response_code(400);
    echo json_encode(['success'=>false,'error'=>'Faltan campos requeridos (Nombre, Tipo)'], JSON_UNESCAPED_UNICODE);
    exit;
}

// Campos opcionales
$mitologia = isset($data['Mitologia']) ? $data['Mitologia'] : '';
$era = isset($data['Era']) ? $data['Era'] : '';
$coste = isset($data['Coste']) ? $data['Coste'] : '';
$fuerza = isset($data['Fuerza']) ? $data['Fuerza'] : '';
$poder = isset($data['Poder']) ? $data['Poder'] : '';
$claves = isset($data['Claves']) ? $data['Claves'] : '';
$texto = isset($data['Texto - Habilidades']) ? $data['Texto - Habilidades'] : (isset($data['Texto']) ? $data['Texto'] : '');
$urlimg = isset($data['URL-IMG']) ? $data['URL-IMG'] : (isset($data['URL_IMG']) ? $data['URL_IMG'] : '');

// Conexión DB (misma configuración que fetch_cards.php)
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "the conjurer";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['success'=>false,'error'=>'Error de conexión: '.$conn->connect_error], JSON_UNESCAPED_UNICODE);
    exit;
}
$conn->set_charset('utf8');

// Intentar insertar. Usamos nombres de columnas exactamente como se usan en el CSV/JS
$sql = "INSERT INTO cartas (`Nombre`,`Tipo`,`Mitologia`,`Era`,`Coste`,`Fuerza`,`Poder`,`Claves`,`Texto - Habilidades`,`URL-IMG`) VALUES (?,?,?,?,?,?,?,?,?,?)";
$stmt = $conn->prepare($sql);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['success'=>false,'error'=>'Error prepare SQL: '.$conn->error], JSON_UNESCAPED_UNICODE);
    $conn->close();
    exit;
}

$stmt->bind_param('ssssssssss', $nombre, $tipo, $mitologia, $era, $coste, $fuerza, $poder, $claves, $texto, $urlimg);
$ok = $stmt->execute();
if (!$ok) {
    http_response_code(500);
    echo json_encode(['success'=>false,'error'=>'Error execute: '.$stmt->error], JSON_UNESCAPED_UNICODE);
    $stmt->close();
    $conn->close();
    exit;
}

$insert_id = $conn->insert_id;
$stmt->close();
$conn->close();

echo json_encode(['success'=>true,'id'=>$insert_id], JSON_UNESCAPED_UNICODE);
?>
