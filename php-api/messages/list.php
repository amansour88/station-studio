<?php
require_once __DIR__ . '/../middleware/cors.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../config/database.php';

requireAdminOrEditor();

try {
    $pdo = getDB();
    
    $filter = $_GET['filter'] ?? 'all';
    
    switch ($filter) {
        case 'unread':
            $stmt = $pdo->prepare("SELECT * FROM contact_messages WHERE is_read = 0 AND is_archived = 0 ORDER BY created_at DESC");
            break;
        case 'archived':
            $stmt = $pdo->prepare("SELECT * FROM contact_messages WHERE is_archived = 1 ORDER BY created_at DESC");
            break;
        default:
            $stmt = $pdo->prepare("SELECT * FROM contact_messages WHERE is_archived = 0 ORDER BY created_at DESC");
    }
    
    $stmt->execute();
    $messages = $stmt->fetchAll();

    echo json_encode($messages);

} catch (Exception $e) {
    error_log("Get messages error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch messages']);
}
