const User = require('../models/User');
const { generateToken, generateTOTPSecret, generateTOTPCode, sendEmail } = require('../utils/auth');

// Helper: champs publics du user
const publicUserFields = ['_id', 'name', 'email', 'avatar', 'whatsapp', 'bio', 'role', 'isVerified', 'createdAt'];

// ============================================================
// @desc    Register user
// @route   POST /api/auth/register
// ============================================================
const registerUser = async (req, res, next) => {
  const { name, email, password } = req.body;
  try {
    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Nom, email et mot de passe requis');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400);
      throw new Error("L'utilisateur existe deja");
    }

    const totpSecret = generateTOTPSecret().base32;
    const otpCode = generateTOTPCode(totpSecret);

    const user = new User({
      name,
      email,
      password, // Le model s'occupe du hashing via pre('save')
      totpSecret,
      isVerified: false
    });

    await user.save();

    await sendEmail(
      email,
      'Bienvenue sur ZenShop - Vérification',
      `Bonjour ${name},\n\nVoici votre code de vérification : ${otpCode}\n\nCe code est valable pour une session locale.`
    );

    const token = generateToken(user._id);

    const userResponse = {};
    publicUserFields.forEach(field => {
      if (user[field] !== undefined) {
        userResponse[field] = user[field];
      }
    });

    res.status(201).json({
      ...userResponse,
      token
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// @desc    Verify email
// @route   POST /api/auth/verify
// ============================================================
const verifyEmail = async (req, res, next) => {
  const { email, code } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404);
      throw new Error('Utilisateur non trouve');
    }

    // En DEV, on accepte souvent 000000 comme bypass
    const isDevBypass = process.env.NODE_ENV !== 'production' && code === '000000';
    
    const { verifyTOTPCode } = require('../utils/auth');
    const isValid = isDevBypass || verifyTOTPCode(user.totpSecret, code);

    if (!isValid) {
      res.status(400);
      throw new Error('Code incorrect ou expire');
    }

    user.isVerified = true;
    await user.save();

    const token = generateToken(user._id);

    const userResponse = {};
    publicUserFields.forEach(field => {
      if (user[field] !== undefined) {
        userResponse[field] = user[field];
      }
    });

    res.json({
      ...userResponse,
      token
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// ============================================================
const resendOTP = async (req, res, next) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404);
      throw new Error('Utilisateur non trouve');
    }

    const otpCode = generateTOTPCode(user.totpSecret);

    await sendEmail(
      email,
      'Nouveau code - ZenShop',
      `Votre nouveau code : ${otpCode}`
    );

    res.json({ ok: true, message: 'Nouveau code envoye' });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// @desc    Login user
// @route   POST /api/auth/login
// ============================================================
const loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      res.status(400);
      throw new Error('Email et mot de passe requis');
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401);
      throw new Error('Identifiants invalides');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401);
      throw new Error('Identifiants invalides');
    }

    if (!user.isVerified) {
      res.status(403).json({ 
        message: 'Votre compte n\'est pas encore vérifié.',
        email: user.email,
        needsVerification: true
      });
      return;
    }

    const token = generateToken(user._id);

    const userResponse = {};
    publicUserFields.forEach(field => {
      if (user[field] !== undefined) {
        userResponse[field] = user[field];
      }
    });

    res.json({
      ...userResponse,
      token
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  verifyEmail,
  resendOTP
};
