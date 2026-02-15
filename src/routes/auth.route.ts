import express from 'express';
import validate from '../middlewares/validate';
import { authValidation } from '../validations';
import { authController } from '../controllers';
import { authLimiter } from '../middlewares/rateLimiter';

const router = express.Router();

router.post('/register', authLimiter, validate(authValidation.register), authController.register);
router.post('/login', authLimiter, validate(authValidation.login), authController.login);
router.post('/refresh-tokens', validate(authValidation.refreshTokens), authController.refreshTokens);
router.get('/verify-email', validate(authValidation.verifyEmail), authController.verifyEmail);
router.post('/resend-verification-email', authLimiter, validate(authValidation.resendVerificationEmail), authController.resendVerificationEmail);

export default router;
