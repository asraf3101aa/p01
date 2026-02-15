import express from 'express';
import auth from '../middlewares/auth.middleware';
import validate from '../middlewares/validate';
import { threadValidation } from '../validations';
import { threadController } from '../controllers';
import { permissions as p } from '../config/rbac.config';

const router = express.Router();

router.route('/')
    .post(auth(p.thread.create), validate(threadValidation.createThread), threadController.createThread)
    .get(auth(p.thread.read), validate(threadValidation.getThreads), threadController.getThreads);

router.get('/user/:userId', auth(p.thread.read), validate(threadValidation.getUserThreads), threadController.getUserThreads);

router.route('/:id')
    .get(auth(p.thread.read), validate(threadValidation.getThread), threadController.getThread)
    .patch(auth(p.thread.update), validate(threadValidation.updateThread), threadController.updateThread)
    .delete(auth(p.thread.delete), validate(threadValidation.deleteThread), threadController.deleteThread);

router.route('/:id/comments')
    .post(auth(p.comment.create), validate(threadValidation.createComment), threadController.createComment)
    .get(auth(p.comment.read), validate(threadValidation.getThreadComments), threadController.getThreadComments);

router.route('/:id/comments/:commentId')
    .patch(auth(p.comment.update), validate(threadValidation.updateComment), threadController.updateComment)
    .delete(auth(p.comment.delete), validate(threadValidation.deleteComment), threadController.deleteComment);

router.route('/:id/subscribe')
    .post(auth(p.thread.subscribe), validate(threadValidation.subscribe), threadController.subscribe)
    .delete(auth(p.thread.subscribe), validate(threadValidation.subscribe), threadController.unsubscribe);

router.route('/:id/like')
    .post(auth(p.thread.like), validate(threadValidation.subscribe), threadController.like)
    .delete(auth(p.thread.like), validate(threadValidation.subscribe), threadController.unlike);

export default router;
