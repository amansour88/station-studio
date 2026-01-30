<?php
require_once __DIR__ . '/../middleware/cors.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../config/database.php';

requireAdminOrEditor();

if ($_SERVER['REQUEST_METHOD'] !== 'PUT' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'ID is required']);
    exit;
}

try {
    $pdo = getDB();
    
    // Encode arrays as JSON
    $services = isset($data['services']) ? json_encode($data['services']) : null;
    $products = isset($data['products']) ? json_encode($data['products']) : null;
    
    $stmt = $pdo->prepare("
        UPDATE stations SET
            name = ?,
            region = ?,
            city = ?,
            address = ?,
            latitude = ?,
            longitude = ?,
            phone = ?,
            services = ?,
            products = ?,
            google_maps_url = ?,
            image_url = ?,
            is_active = ?,
            updated_at = NOW()
        WHERE id = ?
    ");
    
    $stmt->execute([
        $data['name'] ?? '',
        $data['region'] ?? '',
        $data['city'] ?? null,
        $data['address'] ?? null,
        $data['latitude'] ?? null,
        $data['longitude'] ?? null,
        $data['phone'] ?? null,
        $services,
        $products,
        $data['google_maps_url'] ?? null,
        $data['image_url'] ?? null,
        isset($data['is_active']) ? ($data['is_active'] ? 1 : 0) : 1,
        $data['id']
    ]);

    echo json_encode(['success' => true, 'message' => 'Station updated successfully']);

} catch (Exception $e) {
    error_log("Update station error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to update station']);
}
