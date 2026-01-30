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

// Validation
if (!isset($data['email']) || !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Valid email is required']);
    exit;
}

if (!isset($data['password']) || strlen($data['password']) < 6) {
    http_response_code(400);
    echo json_encode(['error' => 'Password must be at least 6 characters']);
    exit;
}

if (!isset($data['username']) || strlen(trim($data['username'])) < 3) {
    http_response_code(400);
    echo json_encode(['error' => 'Username must be at least 3 characters']);
    exit;
}

try {
    $pdo = getDB();
    
    // Check if email exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([trim($data['email'])]);
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['error' => 'Email already exists']);
        exit;
    }
    
    // Check if username exists
    $stmt = $pdo->prepare("SELECT id FROM profiles WHERE username = ?");
    $stmt->execute([trim($data['username'])]);
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['error' => 'Username already exists']);
        exit;
    }
    
    $pdo->beginTransaction();
    
    $userId = generateUUID();
    $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
    
    // Create user
    $stmt = $pdo->prepare("
        INSERT INTO users (id, email, password_hash, is_banned, created_at)
        VALUES (?, ?, ?, 0, NOW())
    ");
    $stmt->execute([
        $userId,
        trim($data['email']),
        $hashedPassword
    ]);
    
    // Create profile
    $profileId = generateUUID();
    $stmt = $pdo->prepare("
        INSERT INTO profiles (id, user_id, username, full_name, created_at, updated_at)
        VALUES (?, ?, ?, ?, NOW(), NOW())
    ");
    $stmt->execute([
        $profileId,
        $userId,
        trim($data['username']),
        $data['full_name'] ?? null
    ]);
    
    // Assign role
    $roleId = generateUUID();
    $role = $data['role'] ?? 'editor';
    if (!in_array($role, ['admin', 'editor'])) {
        $role = 'editor';
    }
    
    $stmt = $pdo->prepare("
        INSERT INTO user_roles (id, user_id, role, created_at)
        VALUES (?, ?, ?, NOW())
    ");
    $stmt->execute([$roleId, $userId, $role]);
    
    $pdo->commit();

    echo json_encode([
        'success' => true,
        'user_id' => $userId,
        'message' => 'User created successfully'
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log("Create user error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to create user']);
}
