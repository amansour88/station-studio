<?php
require_once __DIR__ . '/../middleware/cors.php';
require_once __DIR__ . '/../config/database.php';

try {
    $pdo = getDB();
    
    // Check if we should include inactive (for admin)
    $includeInactive = isset($_GET['all']) && $_GET['all'] === 'true';
    
    if ($includeInactive) {
        $stmt = $pdo->prepare("SELECT * FROM services ORDER BY display_order ASC");
    } else {
        $stmt = $pdo->prepare("SELECT * FROM services WHERE is_active = 1 ORDER BY display_order ASC");
    }
    
    $stmt->execute();
    $services = $stmt->fetchAll();

    echo json_encode($services);

} catch (Exception $e) {
    error_log("Get services error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch services']);
}
