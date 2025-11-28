<?php
// Configuración de la cabecera para devolver JSON con UTF-8
header('Content-Type: application/json; charset=utf-8');

// --- CONFIGURACIÓN DE CONEXIÓN A LA BASE DE DATOS ---
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "the conjurer"; 

// 1. Crear la conexión y verificar errores
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    http_response_code(500); 
    echo json_encode(["error" => "Error de conexión: " . $conn->connect_error], JSON_UNESCAPED_UNICODE);
    exit();
}

// Configurar charset UTF-8
$conn->set_charset("utf8");

// 2. Consulta SQL para la tabla 'cartas'
$sql = "SELECT * FROM cartas ORDER BY ID ASC";
$result = $conn->query($sql);

$allCardsData = [];

// 3. Procesar resultados
if ($result && $result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $allCardsData[] = $row;
    }
}

// 4. Cerrar y devolver JSON
$conn->close();
echo json_encode($allCardsData, JSON_UNESCAPED_UNICODE);
?>