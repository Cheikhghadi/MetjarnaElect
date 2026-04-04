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
  resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const {
  loginLimiter,
  registerLimiter,
  verifyTotpLimiter,
  resendCodeLimiter,
  forgotPasswordLimiter,
  resetPasswordLimiter,
} = require('../middleware/securityMiddleware');

router.post('/register', registerLimiter, registerUser);
router.post('/verify-totp', verifyTotpLimiter, verifyUser);
router.post('/login', loginLimiter, loginUser);
router.post('/resend-code', resendCodeLimiter, resendCode);
router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);
router.post('/reset-password', resetPasswordLimiter, resetPassword);

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

router.get('/profile/:id', getProfileById);
router.get('/user/:id', protect, getUserById);

module.exports = router;
