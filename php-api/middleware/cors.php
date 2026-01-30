<?php
/**
 * CORS Middleware
 * Update the origin with your domain
 */

// Allow from your domain - update this!
$allowed_origins = [
    'https://YOUR_DOMAIN.com',
    'https://www.YOUR_DOMAIN.com',
    'http://localhost:5173', // للتطوير المحلي
    'http://localhost:3000',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    // For production, you might want to be stricter
    header("Access-Control-Allow-Origin: https://YOUR_DOMAIN.com");
}

header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=utf-8");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
