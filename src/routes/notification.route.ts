import express from 'express';
import auth from '../middlewares/auth.middleware';
import validate from '../middlewares/validate';
import { notificationValidation } from '../validations';
import { notificationController } from '../controllers';
import { permissions as p } from '../config/rbac.config';

const router = express.Router();

router.get('/preferences', auth(p.preference.read), notificationController.getPreferences);
router.patch('/preferences', auth(p.preference.update), validate(notificationValidation.updatePreferences), notificationController.updatePreferences);

router.get('/', auth(p.notification.read), notificationController.getNotifications);
router.patch('/:id/read', auth(p.notification.update), validate(notificationValidation.markAsRead), notificationController.markAsRead);

export default router;
