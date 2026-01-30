<?php
require_once __DIR__ . '/../middleware/cors.php';
require_once __DIR__ . '/../config/database.php';

try {
    $pdo = getDB();
    
    $includeInactive = isset($_GET['all']) && $_GET['all'] === 'true';
    
    if ($includeInactive) {
        $stmt = $pdo->prepare("SELECT * FROM partners ORDER BY display_order ASC");
    } else {
        $stmt = $pdo->prepare("SELECT * FROM partners WHERE is_active = 1 ORDER BY display_order ASC");
    }
    
    $stmt->execute();
    $partners = $stmt->fetchAll();

    // Add caching headers for public requests only (5 minutes)
    if (!$includeInactive) {
        header("Cache-Control: public, max-age=300");
        header("ETag: " . md5(json_encode($partners)));
    }
    
    echo json_encode($partners);

} catch (Exception $e) {
    error_log("Get partners error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch partners']);
}
