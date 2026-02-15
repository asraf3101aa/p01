import { z } from 'zod';

export const updatePreferences = {
    body: z.object({
        emailEnabled: z.boolean().optional(),
        inAppEnabled: z.boolean().optional(),
        smsEnabled: z.boolean().optional(),
    }).strict(),
};

export const markAsRead = {
    params: z.object({
        id: z.coerce.number({ message: 'Invalid notification ID' }),
    }),
};
