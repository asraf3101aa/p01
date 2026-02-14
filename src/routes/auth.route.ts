import express from 'express';
import validate from '../middlewares/validate';
import { authValidation } from '../validations';
import { authController } from '../controllers';
import auth from '../middlewares/auth.middleware';
import { permissions as p } from '../config/rbac.config';

const router = express.Router();

router.post('/register', validate(authValidation.register), authController.register);
router.post('/login', validate(authValidation.login), authController.login);
router.post('/refresh-tokens', validate(authValidation.refreshTokens), authController.refreshTokens);
router.get('/me', auth(p.user.read), authController.getAuthUserProfile);

export default router;
