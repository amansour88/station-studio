<?php
require_once __DIR__ . '/../middleware/cors.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../config/database.php';

requireAdmin();

try {
    $pdo = getDB();
    
    $stmt = $pdo->prepare("
        SELECT u.id, u.email, u.is_banned, u.created_at, u.last_sign_in_at,
               p.username, p.full_name,
               ur.role
        FROM users u
        LEFT JOIN profiles p ON u.id = p.user_id
        LEFT JOIN user_roles ur ON u.id = ur.user_id
        ORDER BY u.created_at DESC
    ");
    $stmt->execute();
    $users = $stmt->fetchAll();

    echo json_encode(['users' => $users]);

} catch (Exception $e) {
    error_log("Get users error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch users']);
}
