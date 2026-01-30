<?php
require_once __DIR__ . '/../middleware/cors.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../config/database.php';

requireAdminOrEditor();

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$id = $_GET['id'] ?? null;

if (!$id) {
    http_response_code(400);
    echo json_encode(['error' => 'ID is required']);
    exit;
}

try {
    $pdo = getDB();
    
    $stmt = $pdo->prepare("DELETE FROM stations WHERE id = ?");
    $stmt->execute([$id]);

    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => true, 'message' => 'Station deleted successfully']);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Station not found']);
    }

} catch (Exception $e) {
    error_log("Delete station error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to delete station']);
}
