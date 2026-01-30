<?php
require_once __DIR__ . '/../middleware/cors.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../config/database.php';

if (!isAuthenticated()) {
    echo json_encode([
        'authenticated' => false,
        'user' => null
    ]);
    exit;
}

try {
    $pdo = getDB();
    
    // Get user details
    $stmt = $pdo->prepare("
        SELECT u.id, u.email, ur.role 
        FROM users u 
        LEFT JOIN user_roles ur ON u.id = ur.user_id 
        WHERE u.id = ?
    ");
    $stmt->execute([getCurrentUserId()]);
    $user = $stmt->fetch();

    if (!$user) {
        // User no longer exists, destroy session
        session_destroy();
        echo json_encode([
            'authenticated' => false,
            'user' => null
        ]);
        exit;
    }

    echo json_encode([
        'authenticated' => true,
        'user' => [
            'id' => $user['id'],
            'email' => $user['email'],
            'role' => $user['role'] ?? 'editor'
        ]
    ]);

} catch (Exception $e) {
    error_log("Check session error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to check session']);
}
