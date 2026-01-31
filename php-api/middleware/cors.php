<?php
/**
 * CORS Middleware
 * Update the origin with your domain
 */

// Allow from your domain - update this!
$allowed_origins = [
    'https://aws.sa',
    'https://www.aws.sa',
    'https://station-studio.lovable.app',
    'https://id-preview--b98bc172-4c7e-470a-abb0-5149fd721ca5.lovable.app',
    'https://b98bc172-4c7e-470a-abb0-5149fd721ca5.lovableproject.com',
    'http://localhost:5173',
    'http://localhost:3000',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header("Access-Control-Allow-Origin: https://aws.sa");
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
