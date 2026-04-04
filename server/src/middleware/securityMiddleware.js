const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = rateLimit;

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 12,
  message: { message: 'Trop de tentatives de connexion. Reessayez dans quelques minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { message: 'Trop de creations de compte depuis cette adresse. Reessayez plus tard.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const verifyTotpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { message: 'Trop de verifications. Patientez avant de reessayer.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const resendCodeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { message: 'Limite de renvois de code atteinte. Reessayez dans une heure.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { message: 'Trop de demandes de reinitialisation. Reessayez plus tard.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const resetPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 12,
  message: { message: 'Trop de tentatives. Reessayez plus tard.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const messageWriteLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 40,
  keyGenerator: (req) =>
    req.user && req.user._id ? req.user._id.toString() : ipKeyGenerator(req.ip),
  message: { message: 'Trop de messages envoyes. Ralentissez un instant.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  loginLimiter,
  registerLimiter,
  verifyTotpLimiter,
  resendCodeLimiter,
  forgotPasswordLimiter,
  resetPasswordLimiter,
  messageWriteLimiter,
  apiLimiter,
};
