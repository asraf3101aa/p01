import express from 'express';
import auth from '../middlewares/auth.middleware';
import { userController } from '../controllers';
import { permissions as p } from '../config/rbac.config';
import validate from '../middlewares/validate';
import { userValidation } from '../validations';

const router = express.Router();

router.get('/:id/profile', auth(p.user.read), validate(userValidation.getProfileById), userController.getProfileById);

export default router;
