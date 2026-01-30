<?php
/**
 * Forgot Password - Request password reset
 * طلب استعادة كلمة المرور
 */
require_once __DIR__ . '/../middleware/cors.php';
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/mail.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['email']) || !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'البريد الإلكتروني مطلوب']);
    exit;
}

$email = trim($data['email']);

try {
    $pdo = getDB();
    
    // Find user by email
    $stmt = $pdo->prepare("
        SELECT u.id, u.email, p.full_name, p.username
        FROM users u
        LEFT JOIN profiles p ON u.id = p.user_id
        WHERE u.email = ?
    ");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    // Always return success message (security: don't reveal if email exists)
    if (!$user) {
        echo json_encode([
            'success' => true,
            'message' => 'إذا كان البريد الإلكتروني مسجلاً، سيصلك رابط إعادة تعيين كلمة المرور'
        ]);
        exit;
    }

    // Check if user is banned
    $stmtBan = $pdo->prepare("SELECT is_banned FROM users WHERE id = ?");
    $stmtBan->execute([$user['id']]);
    $userStatus = $stmtBan->fetch();
    
    if ($userStatus && $userStatus['is_banned']) {
        echo json_encode([
            'success' => true,
            'message' => 'إذا كان البريد الإلكتروني مسجلاً، سيصلك رابط إعادة تعيين كلمة المرور'
        ]);
        exit;
    }

    // Delete any existing tokens for this user
    $pdo->prepare("DELETE FROM password_reset_tokens WHERE user_id = ?")->execute([$user['id']]);

    // Generate secure token
    $token = bin2hex(random_bytes(32)); // 64 characters
    $expiresAt = date('Y-m-d H:i:s', time() + PASSWORD_RESET_EXPIRY);
    
    // Save token to database
    $stmt = $pdo->prepare("
        INSERT INTO password_reset_tokens (id, user_id, token, expires_at, created_at)
        VALUES (?, ?, ?, ?, NOW())
    ");
    $stmt->execute([
        generateUUID(),
        $user['id'],
        $token,
        $expiresAt
    ]);

    // Send password reset email
    $resetUrl = getPasswordResetUrl($token);
    $userName = $user['full_name'] ?: $user['username'] ?: 'المستخدم';
    
    $emailContent = "
        <div style='text-align: right; direction: rtl;'>
            <h2 style='color: #1a5f2a;'>إعادة تعيين كلمة المرور</h2>
            <p>مرحباً <strong>{$userName}</strong>،</p>
            <p>تم طلب إعادة تعيين كلمة المرور لحسابك في محطات اوس.</p>
            <p>اضغط على الزر أدناه لإعادة تعيين كلمة المرور:</p>
            <p style='text-align: center; margin: 30px 0;'>
                <a href='{$resetUrl}' 
                   style='background-color: #1a5f2a; color: white; padding: 12px 30px; 
                          text-decoration: none; border-radius: 5px; display: inline-block;
                          font-weight: bold;'>
                    إعادة تعيين كلمة المرور
                </a>
            </p>
            <p>أو انسخ هذا الرابط:</p>
            <p style='background-color: #f5f5f5; padding: 10px; word-break: break-all; 
                      border-radius: 5px; font-size: 12px;'>
                {$resetUrl}
            </p>
            <hr style='margin: 20px 0; border: none; border-top: 1px solid #ddd;'>
            <p style='color: #666; font-size: 14px;'>
                <strong>ملاحظة:</strong> هذا الرابط صالح لمدة ساعة واحدة فقط.
            </p>
            <p style='color: #999; font-size: 12px;'>
                إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذه الرسالة.
            </p>
        </div>
    ";

    $emailSent = sendEmail(
        $user['email'],
        'إعادة تعيين كلمة المرور - محطات اوس',
        $emailContent
    );

    if (!$emailSent) {
        error_log("Failed to send password reset email to: " . $user['email']);
    }

    echo json_encode([
        'success' => true,
        'message' => 'إذا كان البريد الإلكتروني مسجلاً، سيصلك رابط إعادة تعيين كلمة المرور'
    ]);

} catch (Exception $e) {
    error_log("Forgot password error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'حدث خطأ، حاول مرة أخرى']);
}
