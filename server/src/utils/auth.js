const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const nodemailer = require('nodemailer');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Generate TOTP Secret
const generateTOTPSecret = () => {
  return speakeasy.generateSecret({ length: 20 });
};

// Generate 6-digit random code
const generateOTPCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Verify TOTP code
const verifyTOTPCode = (secret, token) => {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token,
    window: 4 // 2 minutes tolerance (4 * 30s)
  });
};

// Send Email (credentials uniquement via SMTP_USER / SMTP_PASS — jamais en dur dans le code)
const sendEmail = async (to, subject, text) => {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass || user === 'votre-email@gmail.com') {
    const msg = 'SMTP_USER ou SMTP_PASS manquant : impossible d\'envoyer l\'email';
    console.error(msg);
    if (process.env.NODE_ENV === 'production') {
      throw new Error(msg);
    }
    console.log('--- DEV (email non envoye) ---');
    console.log(`To: ${to}\nSubject: ${subject}\n${text}`);
    console.log('-------------------------------');
    return;
  }

  const port = Number(process.env.SMTP_PORT) || 465;
  const secure = port === 465;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port,
    secure,
    auth: { user, pass },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });

  const mailOptions = {
    from: `"ZenShop" <${user}>`,
    to,
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
    if (process.env.NODE_ENV !== 'production') {
      console.log('--- DEV FALLBACK ---');
      console.log(`To: ${to}\nSubject: ${subject}\n${text}`);
      console.log('--------------------');
      return;
    }
    throw error;
  }
};

module.exports = {
  generateToken,
  generateTOTPSecret,
  generateOTPCode,
  verifyTOTPCode,
  sendEmail
};
