import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';
import { db } from '../db';
import { users, userRoles, roles, rolePermissions, permissions } from '../db/schema';
import { eq } from 'drizzle-orm';
import catchAsync from '../utils/catchAsync';
import ApiResponse from '../utils/ApiResponse';
import { Permission } from '../config/rbac.config';

declare global {
    namespace Express {
        interface Request {
            user: typeof users.$inferSelect & {
                roles: string[];
                permissions: string[];
            };
        }
    }
}

const auth = (...requiredPermissions: Permission[]) =>
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith('Bearer ')) {
            return ApiResponse.unauthorized(res, 'Please provide a valid access token');
        }

        const token = authHeader.split(' ')[1] ?? "";

        try {
            const payload = jwt.verify(token, config.jwt.secret) as { sub: string };

            if (!payload.sub) {
                return ApiResponse.unauthorized(res);
            }

            const userId = parseInt(payload.sub, 10);
            if (isNaN(userId)) {
                return ApiResponse.unauthorized(res, 'Invalid user ID in token');
            }

            const userRolesData = await db
                .select({
                    user: users,
                    roleName: roles.name,
                    permissionName: permissions.name,
                })
                .from(users)
                .leftJoin(userRoles, eq(users.id, userRoles.userId))
                .leftJoin(roles, eq(userRoles.roleId, roles.id))
                .leftJoin(rolePermissions, eq(roles.id, rolePermissions.roleId))
                .leftJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
                .where(eq(users.id, userId));

            const firstResult = userRolesData[0];
            if (!firstResult || !firstResult.user) {
                return ApiResponse.unauthorized(res, 'User not found');
            }

            const user = firstResult.user;
            const userRolesNames = [...new Set(userRolesData.map((r) => r.roleName).filter(Boolean).map(String))];
            const userPermissions = [...new Set(userRolesData.map((r) => r.permissionName).filter(Boolean).map(String))];

            req.user = {
                ...user,
                roles: userRolesNames,
                permissions: userPermissions,
            };

            if (requiredPermissions.length > 0) {
                const hasPermission = requiredPermissions.every((p) => userPermissions.includes(p));
                if (!hasPermission) {
                    return ApiResponse.forbidden(res, 'You do not have the required permissions');
                }
            }

            return next();
        } catch (error) {
            const message = error instanceof jwt.TokenExpiredError ? 'Token expired' : 'Invalid token';
            return ApiResponse.unauthorized(res, message);
        }
    });

export default auth;