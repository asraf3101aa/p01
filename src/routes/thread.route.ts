import express from 'express';
import auth from '../middlewares/auth.middleware';
import { threadController } from '../controllers';
import { permissions as p } from '../config/rbac.config';

const router = express.Router();

router.route('/')
    .post(auth(p.thread.create), threadController.createThread)
    .get(auth(p.thread.read), threadController.getThreads);

router.get('/:id', auth(p.thread.read), threadController.getThread);

router.post('/:id/comments', auth(p.comment.create), threadController.createComment);

router.route('/:id/subscribe')
    .post(auth(p.thread.subscribe), threadController.subscribe)
    .delete(auth(p.thread.subscribe), threadController.unsubscribe);

export default router;
