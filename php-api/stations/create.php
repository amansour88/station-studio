<?php
require_once __DIR__ . '/../middleware/cors.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../config/database.php';

requireAdminOrEditor();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['name']) || empty(trim($data['name']))) {
    http_response_code(400);
    echo json_encode(['error' => 'Name is required']);
    exit;
}

if (!isset($data['region']) || empty(trim($data['region']))) {
    http_response_code(400);
    echo json_encode(['error' => 'Region is required']);
    exit;
}

try {
    $pdo = getDB();
    
    $id = generateUUID();
    
    // Encode arrays as JSON
    $services = isset($data['services']) ? json_encode($data['services']) : null;
    $products = isset($data['products']) ? json_encode($data['products']) : null;
    
    $stmt = $pdo->prepare("
        INSERT INTO stations (id, name, region, city, address, latitude, longitude, phone, services, products, google_maps_url, image_url, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    ");
    
    $stmt->execute([
        $id,
        trim($data['name']),
        trim($data['region']),
        $data['city'] ?? null,
        $data['address'] ?? null,
        $data['latitude'] ?? null,
        $data['longitude'] ?? null,
        $data['phone'] ?? null,
        $services,
        $products,
        $data['google_maps_url'] ?? null,
        $data['image_url'] ?? null,
        isset($data['is_active']) ? ($data['is_active'] ? 1 : 0) : 1
    ]);

    echo json_encode([
        'success' => true,
        'id' => $id,
        'message' => 'Station created successfully'
    ]);

} catch (Exception $e) {
    error_log("Create station error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to create station']);
}
