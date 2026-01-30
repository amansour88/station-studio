<?php
require_once __DIR__ . '/../middleware/cors.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../config/database.php';

requireAdminOrEditor();

try {
    $pdo = getDB();
    
    // Get services count
    $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM services");
    $stmt->execute();
    $services = $stmt->fetch()['count'];
    
    // Get stations count
    $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM stations");
    $stmt->execute();
    $stations = $stmt->fetch()['count'];
    
    // Get partners count
    $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM partners");
    $stmt->execute();
    $partners = $stmt->fetch()['count'];
    
    // Get messages count
    $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM contact_messages");
    $stmt->execute();
    $messages = $stmt->fetch()['count'];
    
    // Get unread messages count
    $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM contact_messages WHERE is_read = 0 AND is_archived = 0");
    $stmt->execute();
    $unreadMessages = $stmt->fetch()['count'];

    echo json_encode([
        'services' => (int)$services,
        'stations' => (int)$stations,
        'partners' => (int)$partners,
        'messages' => (int)$messages,
        'unreadMessages' => (int)$unreadMessages
    ]);

} catch (Exception $e) {
    error_log("Get dashboard stats error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch dashboard stats']);
}
