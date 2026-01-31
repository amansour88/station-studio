<?php
require_once __DIR__ . '/../middleware/cors.php';
require_once __DIR__ . '/../config/database.php';

try {
    $pdo = getDB();
    
    $stmt = $pdo->prepare("SELECT * FROM hero_section WHERE is_active = 1 LIMIT 1");
    $stmt->execute();
    $hero = $stmt->fetch();

    // Add caching headers (5 minutes)
    header("Cache-Control: public, max-age=300");
    if ($hero) {
        // Parse JSON stats if stored as JSON string
        if (isset($hero['stats']) && is_string($hero['stats'])) {
            $hero['stats'] = json_decode($hero['stats'], true);
        }
        header("ETag: " . md5(json_encode($hero)));
        echo json_encode($hero);
    } else {
        echo json_encode(null);
    }

} catch (Exception $e) {
    error_log("Get hero error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch hero data']);
}
