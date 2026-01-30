<?php
require_once __DIR__ . '/../middleware/cors.php';
require_once __DIR__ . '/../config/database.php';

try {
    $pdo = getDB();
    
    $includeInactive = isset($_GET['all']) && $_GET['all'] === 'true';
    
    if ($includeInactive) {
        $stmt = $pdo->prepare("SELECT * FROM stations ORDER BY region ASC, name ASC");
    } else {
        $stmt = $pdo->prepare("SELECT * FROM stations WHERE is_active = 1 ORDER BY region ASC, name ASC");
    }
    
    $stmt->execute();
    $stations = $stmt->fetchAll();

    // Parse JSON fields
    foreach ($stations as &$station) {
        if (isset($station['services']) && is_string($station['services'])) {
            $station['services'] = json_decode($station['services'], true);
        }
        if (isset($station['products']) && is_string($station['products'])) {
            $station['products'] = json_decode($station['products'], true);
        }
    }

    // Add caching headers for public requests only (5 minutes)
    if (!$includeInactive) {
        header("Cache-Control: public, max-age=300");
        header("ETag: " . md5(json_encode($stations)));
    }
    
    echo json_encode($stations);

} catch (Exception $e) {
    error_log("Get stations error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch stations']);
}
