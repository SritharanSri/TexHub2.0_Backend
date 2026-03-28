const router = require('express').Router();
const auth = require('../controllers/auth.controller');
const validate = require('../middlewares/validate');
const {
  signupSchema, loginSchema, otpSchema, resendOtpSchema,
  googleAuthSchema, forgotPasswordSchema, resetPasswordSchema,
} = require('../utils/validators/auth.validator');

router.post('/signup', validate(signupSchema), auth.signup);
router.post('/login', validate(loginSchema), auth.login);
router.post('/verify-otp', validate(otpSchema), auth.verifyOtp);
router.post('/resend-otp', validate(resendOtpSchema), auth.resendOtp);
router.post('/google', validate(googleAuthSchema), auth.googleAuth);
router.post('/forgot-password', validate(forgotPasswordSchema), auth.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), auth.resetPassword);

module.exports = router;
