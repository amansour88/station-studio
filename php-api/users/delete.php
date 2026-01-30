<?php
require_once __DIR__ . '/../middleware/cors.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../config/database.php';

requireAdmin();

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$userId = $_GET['user_id'] ?? null;

if (!$userId) {
    http_response_code(400);
    echo json_encode(['error' => 'User ID is required']);
    exit;
}

// Prevent self-deletion
if ($userId === getCurrentUserId()) {
    http_response_code(400);
    echo json_encode(['error' => 'Cannot delete your own account']);
    exit;
}

try {
    $pdo = getDB();
    
    $pdo->beginTransaction();
    
    // Delete user role
    $stmt = $pdo->prepare("DELETE FROM user_roles WHERE user_id = ?");
    $stmt->execute([$userId]);
    
    // Delete profile
    $stmt = $pdo->prepare("DELETE FROM profiles WHERE user_id = ?");
    $stmt->execute([$userId]);
    
    // Delete user
    $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    
    $pdo->commit();

    echo json_encode(['success' => true, 'message' => 'User deleted successfully']);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log("Delete user error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to delete user']);
}
