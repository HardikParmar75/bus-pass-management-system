const nodemailer = require('nodemailer');

// Lazily create transporter so env vars are available
function getTransporter() {
  const user = process.env.EMAIL;
  const pass = process.env.PASS;
  if (!user || !pass) throw new Error('Missing EMAIL or PASS in environment');

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user, pass },
  });
}

function getPasswordResetTemplate(userName, resetCode) {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Password Reset</title>
    <style>
      body{font-family:Arial,Helvetica,sans-serif;background:#f5f7fa;margin:0;padding:0}
      .card{max-width:600px;margin:28px auto;background:#fff;border-radius:8px;overflow:hidden}
      .header{background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;padding:24px;text-align:center}
      .body{Padding:24px;color:#333}
      .code{display:block;font-family:monospace;background:#f0f4ff;border-left:4px solid #667eea;padding:16px;margin:18px 0;font-size:24px;text-align:center;color:#1f2d6b}
      .footer{background:#f5f7fa;padding:16px;text-align:center;font-size:12px;color:#888}
    </style>
  </head>
  <body>
    <div class="card">
      <div class="header">
        <h1>Bus Pass Management System</h1>
        <div>Password Reset Request</div>
      </div>
      <div class="body">
        <p>Hello <strong>${userName}</strong>,</p>
        <p>We received a request to reset your password. Use the code below to reset it. This code expires in 15 minutes.</p>
        <div class="code">${resetCode}</div>
        <p>If you did not request a password reset, ignore this email.</p>
        <p style="margin-top:16px">Need help? Contact hardikparmar7557@gmail.com</p>
      </div>
      <div class="footer">© 2026 National Transport Authority</div>
    </div>
  </body>
</html>`;
}

async function sendPasswordResetEmail(to, userName, resetCode) {
  const transporter = getTransporter();
  const html = getPasswordResetTemplate(userName || 'User', resetCode);
  const info = await transporter.sendMail({
    from: process.env.EMAIL,
    to,
    subject: 'Password Reset - Bus Pass Management System',
    html,
    text: `Your password reset code is: ${resetCode}`,
  });
  return info;
}

module.exports = { sendPasswordResetEmail };
