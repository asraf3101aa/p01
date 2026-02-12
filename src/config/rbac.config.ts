export enum Resource {
    USER = 'user',
    ROLE = 'role',
    PERMISSION = 'permission',
    DEVICE = 'device',
    THREAD = 'thread',
    COMMENT = 'comment',
}

export enum Action {
    READ = 'read',
    CREATE = 'create',
    UPDATE = 'update',
    DELETE = 'delete',
}

export type Permission = `${Resource}_${Action}`;

export const ALL_PERMISSIONS: Permission[] = Object.values(Resource).flatMap((resource) =>
    Object.values(Action).map((action) => `${resource}_${action}` as Permission)
);

export const permissions = Object.fromEntries(
    Object.values(Resource).map((res) => [
        res,
        Object.fromEntries(Object.values(Action).map((act) => [act, `${res}_${act}` as Permission])),
    ])
) as { [R in Resource]: { [A in Action]: `${R}_${A}` } };

export const ROLES = {
    SUPER_ADMIN: {
        name: 'SUPER_ADMIN',
        description: 'Full access to all resources',
        permissions: ALL_PERMISSIONS,
    },
    USER: {
        name: 'USER',
        description: 'Standard user access',
        permissions: [
            permissions.user.read,
            permissions.device.read,
            permissions.device.create,
            permissions.device.delete,
            permissions.thread.read,
            permissions.thread.create,
            permissions.comment.read,
            permissions.comment.create,
        ],
    },
} as const;

export type RoleName = keyof typeof ROLES;
