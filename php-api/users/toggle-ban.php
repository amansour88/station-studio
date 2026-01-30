<?php
require_once __DIR__ . '/../middleware/cors.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../config/database.php';

requireAdmin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['user_id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'User ID is required']);
    exit;
}

// Prevent self-ban
if ($data['user_id'] === getCurrentUserId()) {
    http_response_code(400);
    echo json_encode(['error' => 'Cannot ban your own account']);
    exit;
}

try {
    $pdo = getDB();
    
    $ban = isset($data['ban']) ? ($data['ban'] ? 1 : 0) : null;
    
    if ($ban === null) {
        // Toggle current state
        $stmt = $pdo->prepare("UPDATE users SET is_banned = NOT is_banned WHERE id = ?");
    } else {
        $stmt = $pdo->prepare("UPDATE users SET is_banned = ? WHERE id = ?");
    }
    
    if ($ban === null) {
        $stmt->execute([$data['user_id']]);
    } else {
        $stmt->execute([$ban, $data['user_id']]);
    }

    echo json_encode(['success' => true, 'message' => 'User ban status updated']);

} catch (Exception $e) {
    error_log("Toggle ban error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to update ban status']);
}
