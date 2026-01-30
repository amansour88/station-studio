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

try {
    $pdo = getDB();
    
    $id = generateUUID();
    
    $stmt = $pdo->prepare("
        INSERT INTO partners (id, name, description, logo_url, website_url, display_order, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    ");
    
    $stmt->execute([
        $id,
        trim($data['name']),
        $data['description'] ?? null,
        $data['logo_url'] ?? null,
        $data['website_url'] ?? null,
        $data['display_order'] ?? 0,
        isset($data['is_active']) ? ($data['is_active'] ? 1 : 0) : 1
    ]);

    echo json_encode([
        'success' => true,
        'id' => $id,
        'message' => 'Partner created successfully'
    ]);

} catch (Exception $e) {
    error_log("Create partner error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to create partner']);
}
