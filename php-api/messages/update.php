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
    
    // Build dynamic update query
    $updates = [];
    $params = [];
    
    if (isset($data['is_read'])) {
        $updates[] = "is_read = ?";
        $params[] = $data['is_read'] ? 1 : 0;
    }
    
    if (isset($data['is_archived'])) {
        $updates[] = "is_archived = ?";
        $params[] = $data['is_archived'] ? 1 : 0;
    }
    
    if (empty($updates)) {
        http_response_code(400);
        echo json_encode(['error' => 'No fields to update']);
        exit;
    }
    
    $params[] = $data['id'];
    
    $sql = "UPDATE contact_messages SET " . implode(", ", $updates) . " WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    echo json_encode(['success' => true, 'message' => 'Message updated successfully']);

} catch (Exception $e) {
    error_log("Update message error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to update message']);
}
