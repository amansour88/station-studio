<?php
require_once __DIR__ . '/../middleware/cors.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../config/database.php';

requireAdminOrEditor();

try {
    $pdo = getDB();
    
    // Get total count
    $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM contact_messages");
    $stmt->execute();
    $total = $stmt->fetch()['total'];
    
    // Get unread count
    $stmt = $pdo->prepare("SELECT COUNT(*) as unread FROM contact_messages WHERE is_read = 0 AND is_archived = 0");
    $stmt->execute();
    $unread = $stmt->fetch()['unread'];

    echo json_encode([
        'total' => (int)$total,
        'unread' => (int)$unread
    ]);

} catch (Exception $e) {
    error_log("Get message stats error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch message stats']);
}
