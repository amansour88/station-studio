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
        UPDATE regions SET
            name = ?,
            slug = ?,
            map_url = ?,
            is_active = ?,
            display_order = ?,
            updated_at = NOW()
        WHERE id = ?
    ");
    
    $stmt->execute([
        $data['name'] ?? '',
        $data['slug'] ?? '',
        $data['map_url'] ?? null,
        isset($data['is_active']) ? ($data['is_active'] ? 1 : 0) : 1,
        $data['display_order'] ?? 0,
        $data['id']
    ]);

    echo json_encode(['success' => true, 'message' => 'Region updated successfully']);

} catch (PDOException $e) {
    if ($e->getCode() == 23000) {
        http_response_code(400);
        echo json_encode(['error' => 'Slug already exists']);
    } else {
        error_log("Update region error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update region']);
    }
}
