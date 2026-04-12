const User = require('../models/User');
const Product = require('../models/Product');
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

    let user = await User.findOne({ email });
    if (user && user.isVerified) {
      res.status(400);
      throw new Error("L'utilisateur existe deja avec cet email.");
    }

    const otpCode = generateOTPCode();

    if (!user) {
      user = new User({
        name,
        email,
        password, // Le model s'occupe du hashing via pre('save')
        otpCode,
        otpExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        isVerified: false
      });
    } else {
      // Reprendre un compte non-vérifié (permet de corriger une erreur d'email précédente)
      user.name = name;
      user.password = password;
      user.otpCode = otpCode;
      user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    }

    await user.save();

    try {
      await sendEmail(
        email,
        'Bienvenue sur ZenShop - Vérification',
        `Bonjour ${name},\n\nVoici votre code de vérification : ${otpCode}\n\nCe code est valable pour une session locale.`
      );
    } catch (emailError) {
      // On ne supprime plus l'utilisateur ici, car la nouvelle logique au-dessus
      // permet de retenter l'inscription (elle mettra à jour l'entrée non-vérifiée).
      res.status(500);
      const isProd = process.env.NODE_ENV === 'production';
      const helpMsg = isProd 
        ? "L'envoi de l'email a échoué. Assurez-vous d'avoir configuré SMTP_USER et SMTP_PASS dans le dashboard Render (onglet Environment)."
        : "L'envoi de l'email a échoué. Vérifiez vos paramètres SMTP ou utilisez le code 000000 (Mode Test).";
      
      throw new Error(`Compte créé mais l'envoi du code a échoué. ${helpMsg}`);
    }

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
    const isCodeValid = user.otpCode === code && user.otpExpires > new Date();
    
    const isValid = isDevBypass || isCodeValid;

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

    const otpCode = generateOTPCode();
    user.otpCode = otpCode;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

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

// ============================================================
// @desc    Update user profile
// @route   PUT /api/auth/profile
// ============================================================
const updateProfile = async (req, res, next) => {
  const { name, avatar, whatsapp, bio } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('Utilisateur non trouve');
    }
    
    if (name) user.name = name;
    if (avatar) user.avatar = avatar;
    if (whatsapp) user.whatsapp = whatsapp;
    if (bio) user.bio = bio;
    
    const updatedUser = await user.save();
    
    const userResponse = {};
    publicUserFields.forEach(field => {
      if (updatedUser[field] !== undefined) {
        userResponse[field] = updatedUser[field];
      }
    });

    res.json(userResponse);
  } catch (error) {
    next(error);
  }
};

// ============================================================
// @desc    Get user profile
// @route   GET /api/auth/profile/:id
// ============================================================
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('Utilisateur non trouve');
    }

    const userResponse = {};
    publicUserFields.forEach(field => {
      if (user[field] !== undefined) {
        userResponse[field] = user[field];
      }
    });

    const products = await Product.find({ seller: user._id }).sort({ createdAt: -1 });

    res.json({
      user: userResponse,
      products
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  verifyEmail,
  resendOTP,
  updateProfile,
  getProfile
};
