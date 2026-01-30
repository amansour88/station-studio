<?php
require_once __DIR__ . '/../middleware/cors.php';
require_once __DIR__ . '/../config/database.php';

try {
    $pdo = getDB();
    
    $includeInactive = isset($_GET['all']) && $_GET['all'] === 'true';
    
    if ($includeInactive) {
        $stmt = $pdo->prepare("SELECT * FROM regions ORDER BY display_order ASC");
    } else {
        $stmt = $pdo->prepare("SELECT * FROM regions WHERE is_active = 1 ORDER BY display_order ASC");
    }
    
    $stmt->execute();
    $regions = $stmt->fetchAll();

    echo json_encode($regions);

} catch (Exception $e) {
    error_log("Get regions error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch regions']);
}
