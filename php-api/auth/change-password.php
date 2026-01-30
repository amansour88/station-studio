<?php
require_once __DIR__ . '/../middleware/cors.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../config/database.php';

requireAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['new_password']) || strlen($data['new_password']) < 6) {
    http_response_code(400);
    echo json_encode(['error' => 'Password must be at least 6 characters']);
    exit;
}

try {
    $pdo = getDB();
    
    $hashedPassword = password_hash($data['new_password'], PASSWORD_DEFAULT);
    
    $stmt = $pdo->prepare("UPDATE users SET password_hash = ? WHERE id = ?");
    $stmt->execute([$hashedPassword, getCurrentUserId()]);

    echo json_encode(['success' => true, 'message' => 'Password changed successfully']);

} catch (Exception $e) {
    error_log("Change password error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to change password']);
}
