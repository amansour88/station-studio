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

if (!isset($data['title']) || empty(trim($data['title']))) {
    http_response_code(400);
    echo json_encode(['error' => 'Title is required']);
    exit;
}

try {
    $pdo = getDB();
    
    $id = generateUUID();
    
    $stmt = $pdo->prepare("
        INSERT INTO services (id, title, description, icon, image_url, display_order, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    ");
    
    $stmt->execute([
        $id,
        trim($data['title']),
        $data['description'] ?? null,
        $data['icon'] ?? 'Fuel',
        $data['image_url'] ?? null,
        $data['display_order'] ?? 0,
        isset($data['is_active']) ? ($data['is_active'] ? 1 : 0) : 1
    ]);

    echo json_encode([
        'success' => true,
        'id' => $id,
        'message' => 'Service created successfully'
    ]);

} catch (Exception $e) {
    error_log("Create service error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to create service']);
}
