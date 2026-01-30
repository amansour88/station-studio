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

if (!isset($data['slug']) || empty(trim($data['slug']))) {
    http_response_code(400);
    echo json_encode(['error' => 'Slug is required']);
    exit;
}

try {
    $pdo = getDB();
    
    $id = generateUUID();
    
    $stmt = $pdo->prepare("
        INSERT INTO regions (id, name, slug, map_url, is_active, display_order, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
    ");
    
    $stmt->execute([
        $id,
        trim($data['name']),
        trim($data['slug']),
        $data['map_url'] ?? null,
        isset($data['is_active']) ? ($data['is_active'] ? 1 : 0) : 1,
        $data['display_order'] ?? 0
    ]);

    echo json_encode([
        'success' => true,
        'id' => $id,
        'message' => 'Region created successfully'
    ]);

} catch (PDOException $e) {
    if ($e->getCode() == 23000) {
        http_response_code(400);
        echo json_encode(['error' => 'Slug already exists']);
    } else {
        error_log("Create region error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create region']);
    }
}
