<?php
require_once __DIR__ . '/../middleware/cors.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../config/database.php';

requireAdminOrEditor();

if ($_SERVER['REQUEST_METHOD'] !== 'PUT' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'ID is required']);
    exit;
}

try {
    $pdo = getDB();
    
    // Encode stats as JSON if it's an array
    $stats = isset($data['stats']) ? json_encode($data['stats']) : null;
    
    $stmt = $pdo->prepare("
        UPDATE hero_section SET
            title = ?,
            subtitle = ?,
            description = ?,
            background_image_url = ?,
            cta_text = ?,
            cta_link = ?,
            stats = ?,
            updated_at = NOW(),
            updated_by = ?
        WHERE id = ?
    ");
    
    $stmt->execute([
        $data['title'] ?? '',
        $data['subtitle'] ?? '',
        $data['description'] ?? null,
        $data['background_image_url'] ?? null,
        $data['cta_text'] ?? null,
        $data['cta_link'] ?? null,
        $stats,
        getCurrentUserId(),
        $data['id']
    ]);

    echo json_encode(['success' => true, 'message' => 'Hero updated successfully']);

} catch (Exception $e) {
    error_log("Update hero error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to update hero']);
}
