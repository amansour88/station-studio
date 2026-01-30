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
    
    $stmt = $pdo->prepare("
        UPDATE services SET
            title = ?,
            description = ?,
            icon = ?,
            image_url = ?,
            display_order = ?,
            is_active = ?,
            updated_at = NOW()
        WHERE id = ?
    ");
    
    $stmt->execute([
        $data['title'] ?? '',
        $data['description'] ?? null,
        $data['icon'] ?? 'Fuel',
        $data['image_url'] ?? null,
        $data['display_order'] ?? 0,
        isset($data['is_active']) ? ($data['is_active'] ? 1 : 0) : 1,
        $data['id']
    ]);

    echo json_encode(['success' => true, 'message' => 'Service updated successfully']);

} catch (Exception $e) {
    error_log("Update service error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to update service']);
}
