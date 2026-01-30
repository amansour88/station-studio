<?php
require_once __DIR__ . '/../middleware/cors.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../config/database.php';

requireAdminOrEditor();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !is_array($data)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid data']);
    exit;
}

try {
    $pdo = getDB();
    
    $allowedKeys = ['facebook_url', 'twitter_url', 'instagram_url', 'linkedin_url', 'phone', 'email', 'address'];
    
    foreach ($data as $key => $value) {
        if (!in_array($key, $allowedKeys)) continue;
        
        $stmt = $pdo->prepare("
            INSERT INTO site_settings (id, setting_key, setting_value, updated_at) 
            VALUES (UUID(), ?, ?, NOW())
            ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = NOW()
        ");
        $stmt->execute([$key, $value]);
    }
    
    echo json_encode(['success' => true, 'message' => 'Settings updated']);

} catch (Exception $e) {
    error_log("Update settings error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to update settings']);
}
