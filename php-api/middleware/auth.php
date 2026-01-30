<?php
/**
 * Authentication Middleware
 */

// Start session with secure settings
if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.cookie_httponly', 1);
    ini_set('session.cookie_secure', 1);
    ini_set('session.cookie_samesite', 'Lax');
    session_start();
}

/**
 * Check if user is authenticated
 */
function isAuthenticated(): bool {
    return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
}

/**
 * Require authentication - exits with 401 if not authenticated
 */
function requireAuth(): void {
    if (!isAuthenticated()) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
}

/**
 * Check if current user is admin
 */
function isAdmin(): bool {
    return isset($_SESSION['role']) && $_SESSION['role'] === 'admin';
}

/**
 * Check if current user is admin or editor
 */
function isAdminOrEditor(): bool {
    return isset($_SESSION['role']) && 
           in_array($_SESSION['role'], ['admin', 'editor']);
}

/**
 * Require admin role - exits with 403 if not admin
 */
function requireAdmin(): void {
    requireAuth();
    if (!isAdmin()) {
        http_response_code(403);
        echo json_encode(['error' => 'Admin access required']);
        exit;
    }
}

/**
 * Require admin or editor role
 */
function requireAdminOrEditor(): void {
    requireAuth();
    if (!isAdminOrEditor()) {
        http_response_code(403);
        echo json_encode(['error' => 'Access denied']);
        exit;
    }
}

/**
 * Get current user ID
 */
function getCurrentUserId(): ?string {
    return $_SESSION['user_id'] ?? null;
}

/**
 * Get current user role
 */
function getCurrentUserRole(): ?string {
    return $_SESSION['role'] ?? null;
}
