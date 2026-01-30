<?php
require_once __DIR__ . '/../middleware/cors.php';
require_once __DIR__ . '/../config/database.php';

// This endpoint is public (for contact form)

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

// Validation
if (!isset($data['name']) || strlen(trim($data['name'])) < 2) {
    http_response_code(400);
    echo json_encode(['error' => 'Name is required (min 2 characters)']);
    exit;
}

if (!isset($data['email']) || !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Valid email is required']);
    exit;
}

if (!isset($data['phone']) || strlen(trim($data['phone'])) < 10) {
    http_response_code(400);
    echo json_encode(['error' => 'Valid phone number is required']);
    exit;
}

if (!isset($data['message']) || strlen(trim($data['message'])) < 10) {
    http_response_code(400);
    echo json_encode(['error' => 'Message is required (min 10 characters)']);
    exit;
}

try {
    $pdo = getDB();
    
    $id = generateUUID();
    
    $stmt = $pdo->prepare("
        INSERT INTO contact_messages (id, name, email, phone, subject, message, type, service_type, attachment_url, is_read, is_archived, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, NOW())
    ");
    
    $stmt->execute([
        $id,
        trim($data['name']),
        trim($data['email']),
        trim($data['phone']),
        $data['subject'] ?? null,
        trim($data['message']),
        $data['type'] ?? 'general',
        $data['service_type'] ?? null,
        $data['attachment_url'] ?? null
    ]);

    // Send email notification to admin
    try {
        require_once __DIR__ . '/../config/mail.php';
        
        $messageData = [
            'id' => $id,
            'name' => trim($data['name']),
            'email' => trim($data['email']),
            'phone' => trim($data['phone']),
            'subject' => $data['subject'] ?? null,
            'message' => trim($data['message']),
            'type' => $data['type'] ?? 'general',
            'service_type' => $data['service_type'] ?? null,
        ];
        
        notifyNewMessage($messageData);
    } catch (Exception $mailError) {
        // Log error but don't fail the request
        error_log("Email notification failed: " . $mailError->getMessage());
    }

    echo json_encode([
        'success' => true,
        'id' => $id,
        'message' => 'Message sent successfully'
    ]);

} catch (Exception $e) {
    error_log("Create message error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to send message']);
}
