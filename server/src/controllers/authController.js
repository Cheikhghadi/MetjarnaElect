const User = require('../models/User');
const Follow = require('../models/Follow');
const Product = require('../models/Product');
const { generateToken, generateTOTPSecret, generateTOTPCode, verifyTOTPCode, sendEmail } = require('../utils/auth');
const { isValidEmail, normalizeEmail, isValidObjectId } = require('../utils/validate');

// Helper: champs publics du user
const publicUserFields = '_id name email avatar whatsapp bio role isVerified createdAt';

// ============================================================
// @desc    Register user
// @route   POST /api/auth/register
// ============================================================
const registerUser = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      res.status(400);
      throw new Error('Email et mot de passe requis');
    }
    const emailNorm = normalizeEmail(email);
    if (!isValidEmail(emailNorm)) {
      res.status(400);
      throw new Error('Adresse email invalide');
    }
    if (password.length < 6) {
      res.status(400);
      throw new Error('Le mot de passe doit contenir au moins 6 caracteres');
    }
    if (password.length > 128) {
      res.status(400);
      throw new Error('Mot de passe trop long');
    }

    let user = await User.findOne({ email: emailNorm });

    if (user) {
      if (user.isVerified) {
        res.status(400);
        throw new Error("L'utilisateur existe deja");
      }
      
      // S'il existe mais n'est pas vérifié (OTP non confirmé), on lui permet de s'inscrire à nouveau
      const totpSecret = generateTOTPSecret();
      user.password = password;
      user.totpSecret = totpSecret.base32;
      await user.save();
      
      const code = generateTOTPCode(totpSecret.base32);
      await sendEmail(
        emailNorm,
        'ZenShop - Nouveau code de verification',
        `Bonjour, voici votre nouveau code de verification ZenShop : ${code}`
      );

      return res.status(200).json({
        message: 'Compte existant mis a jour. Veuillez verifier votre email pour le nouveau code.',
        email: user.email
      });
    }

    const totpSecret = generateTOTPSecret();
    user = await User.create({
      email: emailNorm,
      password,
      totpSecret: totpSecret.base32
    });

    const code = generateTOTPCode(totpSecret.base32);
    await sendEmail(
      emailNorm,
      'ZenShop - Code de verification',
      `Bonjour, votre code de verification ZenShop est : ${code}`
    );

    res.status(201).json({
      message: 'Utilisateur cree. Veuillez verifier votre email pour le code.',
      email: user.email
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// @desc    Verify TOTP and activate user
// @route   POST /api/auth/verify-totp
// ============================================================
const verifyUser = async (req, res, next) => {
  const { email, code } = req.body;
  try {
    if (!email || code == null || code === '') {
      res.status(400);
      throw new Error('Email et code requis');
    }

    const emailNorm = normalizeEmail(email);
    if (!isValidEmail(emailNorm)) {
      res.status(400);
      throw new Error('Adresse email invalide');
    }

    const codeStr = String(code).trim().replace(/\s+/g, '');
    if (!/^\d{6}$/.test(codeStr)) {
      res.status(400);
      throw new Error('Le code doit comporter 6 chiffres');
    }

    const user = await User.findOne({ email: emailNorm });
    if (!user) {
      res.status(404);
      throw new Error('Utilisateur non trouve');
    }

    if (user.isVerified) {
      // Deja verifie : on connecte directement
      return res.json({
        message: 'Compte deja verifie',
        token: generateToken(user._id),
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          whatsapp: user.whatsapp,
          bio: user.bio
        }
      });
    }

    const isTestCode = process.env.NODE_ENV !== 'production' && codeStr === '000000';
    const isValid = isTestCode || verifyTOTPCode(user.totpSecret, codeStr);

    if (!isValid) {
      res.status(400);
      throw new Error('Code invalide ou expire');
    }

    user.isVerified = true;
    await user.save();

    res.json({
      message: 'Compte verifie avec succes',
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        whatsapp: user.whatsapp,
        bio: user.bio
      }
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// ============================================================
const loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      res.status(400);
      throw new Error('Email et mot de passe requis');
    }

    const emailNorm = normalizeEmail(email);
    if (!isValidEmail(emailNorm)) {
      res.status(400);
      throw new Error('Adresse email invalide');
    }
    if (password.length > 128) {
      res.status(401);
      throw new Error('Email ou mot de passe invalide');
    }

    const user = await User.findOne({ email: emailNorm });
    if (!user || !(await user.comparePassword(password))) {
      res.status(401);
      throw new Error('Email ou mot de passe invalide');
    }

    if (!user.isVerified) {
      res.status(401);
      throw new Error('Veuillez verifier votre compte avant de vous connecter');
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      whatsapp: user.whatsapp,
      bio: user.bio,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// @desc    Resend verification code
// @route   POST /api/auth/resend-code
// ============================================================
const resendCode = async (req, res, next) => {
  const { email } = req.body;
  try {
    if (!email) {
      res.status(400);
      throw new Error('Email requis');
    }

    const emailNorm = normalizeEmail(email);
    if (!isValidEmail(emailNorm)) {
      res.status(400);
      throw new Error('Adresse email invalide');
    }

    const user = await User.findOne({ email: emailNorm });
    if (!user) {
      return res.json({
        message: 'Si un compte non verifie existe pour cet email, un nouveau code a ete envoye.',
      });
    }
    if (user.isVerified) {
      return res.json({
        message: 'Si un compte non verifie existe pour cet email, un nouveau code a ete envoye.',
      });
    }

    const totpSecret = generateTOTPSecret();
    user.totpSecret = totpSecret.base32;
    await user.save();

    const code = generateTOTPCode(totpSecret.base32);
    await sendEmail(
      emailNorm,
      'ZenShop - Nouveau code de verification',
      `Bonjour, votre nouveau code de verification ZenShop est : ${code}`
    );

    res.json({ message: 'Nouveau code envoye avec succes' });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// @desc    Get own profile
// @route   GET /api/auth/profile
// ============================================================
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password -totpSecret -resetPasswordCode -resetPasswordExpires');
    if (!user) {
      res.status(404);
      throw new Error('Utilisateur non trouve');
    }

    const followersCount = await Follow.countDocuments({ following: user._id });
    const userObj = user.toObject();
    userObj.followersCount = followersCount;

    res.json(userObj);
  } catch (error) {
    next(error);
  }
};

// ============================================================
// @desc    Update own profile
// @route   PUT /api/auth/profile
// ============================================================
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('Utilisateur non trouve');
    }

    // On accepte les chaines vides (ex: effacer la bio)
    if (req.body.name !== undefined) user.name = req.body.name;
    if (req.body.avatar !== undefined) user.avatar = req.body.avatar;
    if (req.body.whatsapp !== undefined) user.whatsapp = req.body.whatsapp;
    if (req.body.bio !== undefined) user.bio = req.body.bio;

    const updatedUser = await user.save();
    const followersCount = await Follow.countDocuments({ following: updatedUser._id });

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      whatsapp: updatedUser.whatsapp,
      bio: updatedUser.bio,
      role: updatedUser.role,
      followersCount
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// BUG FIX : Route manquante utilisee dans Profile.jsx
// @desc    Get public profile + products of any user
// @route   GET /api/auth/profile/:id
// ============================================================
const getProfileById = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400);
      throw new Error('Identifiant invalide');
    }
    const user = await User.findById(req.params.id).select(
      '-password -totpSecret -resetPasswordCode -resetPasswordExpires'
    );
    if (!user) {
      res.status(404);
      throw new Error('Utilisateur non trouve');
    }

    const [followersCount, products] = await Promise.all([
      Follow.countDocuments({ following: user._id }),
      Product.find({ seller: user._id }).sort({ createdAt: -1 })
    ]);

    const userObj = user.toObject();
    userObj.followersCount = followersCount;

    res.json({ user: userObj, products });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// BUG FIX : Route manquante utilisee dans Messages.jsx et EditProfile.jsx
// @desc    Get basic user info by ID
// @route   GET /api/auth/user/:id
// ============================================================
const getUserById = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400);
      throw new Error('Identifiant invalide');
    }
    const user = await User.findById(req.params.id).select('name avatar whatsapp bio role');
    if (!user) {
      res.status(404);
      throw new Error('Utilisateur non trouve');
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// ============================================================
// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// ============================================================
const forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  try {
    if (!email) {
      res.status(400);
      throw new Error('Email requis');
    }

    const emailNorm = normalizeEmail(email);
    if (!isValidEmail(emailNorm)) {
      res.status(400);
      throw new Error('Adresse email invalide');
    }

    const user = await User.findOne({ email: emailNorm });
    const okMessage = {
      message:
        'Si un compte existe pour cet email, vous recevrez un code de recuperation sous peu.',
    };

    if (!user) {
      return res.json(okMessage);
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordCode = resetCode;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendEmail(
      emailNorm,
      'ZenShop - Recuperation de mot de passe',
      `Bonjour, votre code de recuperation ZenShop est : ${resetCode}. Il expire dans 10 minutes.`
    );

    res.json(okMessage);
  } catch (error) {
    next(error);
  }
};

// ============================================================
// @desc    Reset password
// @route   POST /api/auth/reset-password
// ============================================================
const resetPassword = async (req, res, next) => {
  const { email, code, password } = req.body;
  try {
    if (!email || code == null || code === '' || !password) {
      res.status(400);
      throw new Error('Email, code et nouveau mot de passe requis');
    }

    const emailNorm = normalizeEmail(email);
    if (!isValidEmail(emailNorm)) {
      res.status(400);
      throw new Error('Adresse email invalide');
    }

    const codeStr = String(code).trim().replace(/\s+/g, '');
    if (!/^\d{6}$/.test(codeStr)) {
      res.status(400);
      throw new Error('Code de recuperation invalide');
    }

    if (password.length < 6) {
      res.status(400);
      throw new Error('Le nouveau mot de passe doit contenir au moins 6 caracteres');
    }
    if (password.length > 128) {
      res.status(400);
      throw new Error('Mot de passe trop long');
    }

    const user = await User.findOne({
      email: emailNorm,
      resetPasswordCode: codeStr,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400);
      throw new Error('Code invalide ou expire');
    }

    user.password = password;
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Mot de passe reinitialise avec succes' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  verifyUser,
  loginUser,
  resendCode,
  getProfile,
  updateProfile,
  getProfileById,
  getUserById,
  forgotPassword,
  resetPassword
};
