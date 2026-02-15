import express from 'express';
import auth from '../middlewares/auth.middleware';
import validate from '../middlewares/validate';
import { threadValidation } from '../validations';
import { threadController } from '../controllers';
import { permissions as p } from '../config/rbac.config';

const router = express.Router();

router.route('/')
    .post(auth(p.thread.create), validate(threadValidation.createThread), threadController.createThread)
    .get(auth(p.thread.read), validate(threadValidation.getThreads), threadController.getAuthUserThreads);

router.get('/all', auth(p.thread.read), validate(threadValidation.getThreads), threadController.getThreads);

router.get('/:id', auth(p.thread.read), validate(threadValidation.getThread), threadController.getThread);

router.post('/:id/comments', auth(p.comment.create), validate(threadValidation.createComment), threadController.createComment);

router.route('/:id/subscribe')
    .post(auth(p.thread.subscribe), validate(threadValidation.subscribe), threadController.subscribe)
    .delete(auth(p.thread.subscribe), validate(threadValidation.subscribe), threadController.unsubscribe);

router.route('/:id/like')
    .post(auth(p.thread.like), validate(threadValidation.subscribe), threadController.like)
    .delete(auth(p.thread.like), validate(threadValidation.subscribe), threadController.unlike);

export default router;
