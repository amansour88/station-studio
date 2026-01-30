<?php
require_once __DIR__ . '/../middleware/cors.php';
require_once __DIR__ . '/../config/database.php';

try {
    $pdo = getDB();
    
    $stmt = $pdo->query("SELECT setting_key, setting_value FROM site_settings");
    $rows = $stmt->fetchAll();
    
    $settings = [];
    foreach ($rows as $row) {
        $settings[$row['setting_key']] = $row['setting_value'];
    }
    
    echo json_encode($settings);

} catch (Exception $e) {
    error_log("Get settings error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch settings']);
}
