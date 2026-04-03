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

// Generate 6-digit code
const generateTOTPCode = (secret) => {
  return speakeasy.totp({
    secret: secret,
    encoding: 'base32'
  });
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

// Send Email
const sendEmail = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: `"ZenShop" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
    // In dev, log the code so we can continue without working SMTP
    console.log('--- DEVELOPMENT FALLBACK ---');
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${text}`);
    console.log('----------------------------');
  }
};

module.exports = {
  generateToken,
  generateTOTPSecret,
  generateTOTPCode,
  verifyTOTPCode,
  sendEmail
};
