<?php
/**
 * Homepage Data API - Unified endpoint
 * Returns all homepage data in a single request for faster loading
 */
require_once __DIR__ . '/../middleware/cors.php';
require_once __DIR__ . '/../config/database.php';

try {
    $pdo = getDB();
    
    // Hero Section
    $hero = $pdo->query("SELECT * FROM hero_section WHERE is_active = 1 LIMIT 1")->fetch();
    
    // About Section
    $about = $pdo->query("SELECT * FROM about_section LIMIT 1")->fetch();
    if ($about && isset($about['stats']) && is_string($about['stats'])) {
        $about['stats'] = json_decode($about['stats'], true);
    }
    
    // Services (active only)
    $services = $pdo->query("SELECT * FROM services WHERE is_active = 1 ORDER BY display_order ASC")->fetchAll();
    
    // Regions (active only)
    $regions = $pdo->query("SELECT * FROM regions WHERE is_active = 1 ORDER BY display_order ASC")->fetchAll();
    
    // Stations (active only)
    $stationsStmt = $pdo->query("SELECT * FROM stations WHERE is_active = 1 ORDER BY region ASC, name ASC");
    $stations = $stationsStmt->fetchAll();
    
    // Parse JSON fields for stations
    foreach ($stations as &$station) {
        if (isset($station['services']) && is_string($station['services'])) {
            $station['services'] = json_decode($station['services'], true);
        }
        if (isset($station['products']) && is_string($station['products'])) {
            $station['products'] = json_decode($station['products'], true);
        }
    }
    
    // Partners (active only)
    $partners = $pdo->query("SELECT * FROM partners WHERE is_active = 1 ORDER BY display_order ASC")->fetchAll();
    
    $data = [
        'hero' => $hero,
        'about' => $about,
        'services' => $services,
        'regions' => $regions,
        'stations' => $stations,
        'partners' => $partners,
    ];
    
    // Add caching headers (5 minutes)
    header("Cache-Control: public, max-age=300");
    header("ETag: " . md5(json_encode($data)));
    
    echo json_encode($data);

} catch (Exception $e) {
    error_log("Homepage data error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch homepage data']);
}
