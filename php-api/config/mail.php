<?php
/**
 * دوال إرسال البريد الإلكتروني
 */

require_once __DIR__ . '/config.php';

/**
 * إرسال بريد إلكتروني
 */
function sendEmail($to, $subject, $body, $isHtml = true) {
    if (!SMTP_ENABLED) {
        return ['success' => false, 'error' => 'البريد الإلكتروني غير مفعل'];
    }
    
    // استخدام PHPMailer إذا متوفر
    $phpmailerPath = dirname(__DIR__) . '/vendor/PHPMailer/src/PHPMailer.php';
    
    if (file_exists($phpmailerPath)) {
        return sendWithPHPMailer($to, $subject, $body, $isHtml);
    }
    
    // استخدام mail() العادية
    return sendWithMail($to, $subject, $body, $isHtml);
}

/**
 * إرسال باستخدام PHPMailer
 */
function sendWithPHPMailer($to, $subject, $body, $isHtml) {
    require_once dirname(__DIR__) . '/vendor/PHPMailer/src/Exception.php';
    require_once dirname(__DIR__) . '/vendor/PHPMailer/src/PHPMailer.php';
    require_once dirname(__DIR__) . '/vendor/PHPMailer/src/SMTP.php';
    
    $mail = new PHPMailer\PHPMailer\PHPMailer(true);
    
    try {
        $mail->isSMTP();
        $mail->Host = SMTP_HOST;
        $mail->SMTPAuth = true;
        $mail->Username = SMTP_USER;
        $mail->Password = SMTP_PASS;
        $mail->SMTPSecure = SMTP_SECURE;
        $mail->Port = SMTP_PORT;
        $mail->CharSet = 'UTF-8';
        
        $mail->setFrom(SMTP_FROM, SMTP_FROM_NAME);
        $mail->addAddress($to);
        
        $mail->isHTML($isHtml);
        $mail->Subject = $subject;
        $mail->Body = $body;
        
        $mail->send();
        return ['success' => true];
    } catch (Exception $e) {
        return ['success' => false, 'error' => $mail->ErrorInfo];
    }
}

/**
 * إرسال باستخدام mail() 
 */
function sendWithMail($to, $subject, $body, $isHtml) {
    $headers = "From: " . SMTP_FROM_NAME . " <" . SMTP_FROM . ">\r\n";
    $headers .= "Reply-To: " . SMTP_FROM . "\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: " . ($isHtml ? "text/html" : "text/plain") . "; charset=UTF-8\r\n";
    
    $result = @mail($to, $subject, $body, $headers);
    
    return $result 
        ? ['success' => true] 
        : ['success' => false, 'error' => 'فشل في إرسال البريد'];
}

/**
 * قالب البريد الإلكتروني
 */
function getEmailTemplate($title, $content, $buttonText = null, $buttonUrl = null) {
    $button = '';
    if ($buttonText && $buttonUrl) {
        $button = '
        <tr>
            <td style="padding: 30px 0; text-align: center;">
                <a href="' . $buttonUrl . '" style="
                    background: linear-gradient(135deg, #6B1C23 0%, #8B2830 100%);
                    color: #D4AF37;
                    padding: 15px 40px;
                    text-decoration: none;
                    border-radius: 8px;
                    font-weight: bold;
                    display: inline-block;
                    font-size: 16px;
                ">' . $buttonText . '</a>
            </td>
        </tr>';
    }
    
    $logoUrl = SITE_URL . '/assets/images/logo.png';
    
    return '
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, Tahoma, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
                <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                        <!-- Header -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #6B1C23 0%, #4A1318 100%); padding: 30px; text-align: center;">
                                <img src="' . $logoUrl . '" alt="AWS" style="height: 60px; margin-bottom: 15px;">
                                <h1 style="color: #D4AF37; margin: 0; font-size: 24px;">' . SITE_NAME_AR . '</h1>
                            </td>
                        </tr>
                        
                        <!-- Content -->
                        <tr>
                            <td style="padding: 40px 30px;">
                                <h2 style="color: #6B1C23; margin: 0 0 20px 0; font-size: 22px;">' . $title . '</h2>
                                <div style="color: #333; line-height: 1.8; font-size: 16px;">
                                    ' . $content . '
                                </div>
                            </td>
                        </tr>
                        
                        ' . $button . '
                        
                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #f8f9fa; padding: 25px 30px; text-align: center; border-top: 1px solid #eee;">
                                <p style="color: #666; margin: 0 0 10px 0; font-size: 14px;">
                                    ' . SITE_NAME_AR . ' - شريكك الموثوق على الطريق منذ 1998
                                </p>
                                <p style="color: #999; margin: 0; font-size: 12px;">
                                    هاتف: ' . getSetting('site_phone', '920008436') . ' | البريد: ' . getSetting('site_email', 'info@aws.sa') . '
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>';
}

/**
 * إرسال إشعار رسالة جديدة للمدير
 */
function notifyNewMessage($message) {
    $adminEmail = getSetting('admin_email', ADMIN_EMAIL);
    
    $typeLabels = [
        'general' => 'استفسار عام',
        'complaint' => 'شكوى',
        'job' => 'طلب توظيف',
        'investor' => 'خدمات المستثمرين'
    ];
    
    $content = '
    <p style="font-size: 16px; margin-bottom: 20px;">وصلتك رسالة جديدة من موقع اوس:</p>
    
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: #f8f9fa; border-radius: 8px;">
        <tr>
            <td style="padding: 15px; border-bottom: 1px solid #eee; font-weight: bold; width: 120px; color: #6B1C23;">الاسم:</td>
            <td style="padding: 15px; border-bottom: 1px solid #eee;">' . htmlspecialchars($message['name']) . '</td>
        </tr>
        <tr>
            <td style="padding: 15px; border-bottom: 1px solid #eee; font-weight: bold; color: #6B1C23;">البريد:</td>
            <td style="padding: 15px; border-bottom: 1px solid #eee;">
                <a href="mailto:' . htmlspecialchars($message['email']) . '" style="color: #6B1C23;">' . htmlspecialchars($message['email']) . '</a>
            </td>
        </tr>
        <tr>
            <td style="padding: 15px; border-bottom: 1px solid #eee; font-weight: bold; color: #6B1C23;">الهاتف:</td>
            <td style="padding: 15px; border-bottom: 1px solid #eee;" dir="ltr">' . htmlspecialchars($message['phone'] ?? '-') . '</td>
        </tr>
        <tr>
            <td style="padding: 15px; border-bottom: 1px solid #eee; font-weight: bold; color: #6B1C23;">النوع:</td>
            <td style="padding: 15px; border-bottom: 1px solid #eee;">' . ($typeLabels[$message['type']] ?? $message['type']) . '</td>
        </tr>
        <tr>
            <td style="padding: 15px; font-weight: bold; vertical-align: top; color: #6B1C23;">الرسالة:</td>
            <td style="padding: 15px; line-height: 1.8;">' . nl2br(htmlspecialchars($message['message'])) . '</td>
        </tr>
    </table>';
    
    $html = getEmailTemplate(
        '📩 رسالة جديدة من الموقع', 
        $content, 
        'عرض في لوحة التحكم', 
        SITE_URL . '/admin/messages.php'
    );
    
    return sendEmail($adminEmail, '📩 رسالة جديدة - ' . htmlspecialchars($message['name']), $html);
}

/**
 * إرسال رد على رسالة
 */
function sendMessageReply($to, $name, $replyContent, $originalMessage) {
    $content = '
    <p style="font-size: 18px; margin-bottom: 15px;">مرحباً ' . htmlspecialchars($name) . '،</p>
    
    <div style="font-size: 16px; line-height: 1.8; margin-bottom: 30px;">
        ' . nl2br(htmlspecialchars($replyContent)) . '
    </div>
    
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    
    <p style="color: #888; font-size: 14px; margin-bottom: 10px;">رسالتك الأصلية:</p>
    <blockquote style="background: #f5f5f5; padding: 20px; border-radius: 8px; border-right: 4px solid #D4AF37; margin: 0; color: #666;">
        ' . nl2br(htmlspecialchars($originalMessage)) . '
    </blockquote>';
    
    $html = getEmailTemplate('رد على رسالتك', $content);
    
    return sendEmail($to, 'رد من ' . SITE_NAME_AR, $html);
}
