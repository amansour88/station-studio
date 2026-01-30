<?php
require_once __DIR__ . '/../middleware/cors.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../config/database.php';

requireAdmin();

if ($_SERVER['REQUEST_METHOD'] !== 'PUT' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
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

try {
    $pdo = getDB();
    
    // Update role if provided
    if (isset($data['role'])) {
        $role = $data['role'];
        if (!in_array($role, ['admin', 'editor'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid role']);
            exit;
        }
        
        // Check if role exists
        $stmt = $pdo->prepare("SELECT id FROM user_roles WHERE user_id = ?");
        $stmt->execute([$data['user_id']]);
        $existing = $stmt->fetch();
        
        if ($existing) {
            $stmt = $pdo->prepare("UPDATE user_roles SET role = ? WHERE user_id = ?");
            $stmt->execute([$role, $data['user_id']]);
        } else {
            $roleId = generateUUID();
            $stmt = $pdo->prepare("INSERT INTO user_roles (id, user_id, role, created_at) VALUES (?, ?, ?, NOW())");
            $stmt->execute([$roleId, $data['user_id'], $role]);
        }
    }

    echo json_encode(['success' => true, 'message' => 'User updated successfully']);

} catch (Exception $e) {
    error_log("Update user error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to update user']);
}
