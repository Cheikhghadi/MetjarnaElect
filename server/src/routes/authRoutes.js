const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Auth publiques
router.post('/register', registerUser);
router.post('/verify-totp', verifyUser);
router.post('/login', loginUser);
router.post('/resend-code', resendCode);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Profil prive (utilisateur connecte)
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

// BUG FIX : Routes manquantes cote client
// Profil public d'un utilisateur + ses produits
router.get('/profile/:id', getProfileById);
// Infos basiques d'un utilisateur (messagerie, editProfile)
router.get('/user/:id', protect, getUserById);

module.exports = router;
