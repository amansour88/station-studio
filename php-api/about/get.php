<?php
require_once __DIR__ . '/../middleware/cors.php';
require_once __DIR__ . '/../config/database.php';

try {
    $pdo = getDB();
    
    $stmt = $pdo->prepare("SELECT * FROM about_section LIMIT 1");
    $stmt->execute();
    $about = $stmt->fetch();

    // Add caching headers (5 minutes)
    header("Cache-Control: public, max-age=300");
    
    if ($about) {
        // Parse JSON stats if stored as JSON string
        if (isset($about['stats']) && is_string($about['stats'])) {
            $about['stats'] = json_decode($about['stats'], true);
        }
        header("ETag: " . md5(json_encode($about)));
        echo json_encode($about);
    } else {
        echo json_encode(null);
    }

} catch (Exception $e) {
    error_log("Get about error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch about data']);
}
