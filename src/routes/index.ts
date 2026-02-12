import express from 'express';
import authRoute from './auth.route';
import userRoute from './user.route';
import threadRoute from './thread.route';

const router = express.Router();

const defaultRoutes = [
    {
        path: '/auth',
        route: authRoute,
    },
    {
        path: '/users',
        route: userRoute,
    },
    {
        path: '/threads',
        route: threadRoute,
    },
];

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});

export default router;
