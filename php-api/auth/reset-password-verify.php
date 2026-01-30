<?php
/**
 * Reset Password Verify - Complete password reset
 * تنفيذ إعادة تعيين كلمة المرور
 */
require_once __DIR__ . '/../middleware/cors.php';
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

// Validate input
if (!isset($data['token']) || empty($data['token'])) {
    http_response_code(400);
    echo json_encode(['error' => 'رمز التحقق مطلوب']);
    exit;
}

if (!isset($data['password']) || strlen($data['password']) < 6) {
    http_response_code(400);
    echo json_encode(['error' => 'كلمة المرور يجب أن تكون 6 أحرف على الأقل']);
    exit;
}

$token = trim($data['token']);
$password = $data['password'];

try {
    $pdo = getDB();
    
    // Find valid token
    $stmt = $pdo->prepare("
        SELECT prt.*, u.email, p.username
        FROM password_reset_tokens prt
        JOIN users u ON prt.user_id = u.id
        LEFT JOIN profiles p ON u.id = p.user_id
        WHERE prt.token = ? AND prt.expires_at > NOW()
    ");
    $stmt->execute([$token]);
    $resetToken = $stmt->fetch();

    if (!$resetToken) {
        http_response_code(400);
        echo json_encode(['error' => 'رابط إعادة التعيين غير صالح أو منتهي الصلاحية']);
        exit;
    }

    // Check if user is banned
    $stmtBan = $pdo->prepare("SELECT is_banned FROM users WHERE id = ?");
    $stmtBan->execute([$resetToken['user_id']]);
    $user = $stmtBan->fetch();
    
    if ($user && $user['is_banned']) {
        http_response_code(403);
        echo json_encode(['error' => 'الحساب موقوف']);
        exit;
    }

    // Update password
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("UPDATE users SET password_hash = ? WHERE id = ?");
    $stmt->execute([$passwordHash, $resetToken['user_id']]);

    // Delete the used token
    $pdo->prepare("DELETE FROM password_reset_tokens WHERE id = ?")->execute([$resetToken['id']]);

    // Also delete any other tokens for this user (cleanup)
    $pdo->prepare("DELETE FROM password_reset_tokens WHERE user_id = ?")->execute([$resetToken['user_id']]);

    echo json_encode([
        'success' => true,
        'message' => 'تم تغيير كلمة المرور بنجاح'
    ]);

} catch (Exception $e) {
    error_log("Reset password error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'حدث خطأ، حاول مرة أخرى']);
}
