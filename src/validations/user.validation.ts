import z from "zod";

export const getProfileById = {
    params: z.object({
        id: z.coerce.number("Invalid user ID"),
    }),
};

export const updateProfile = {
    body: z.object({
        name: z.string().optional(),
        avatar: z.string().optional(),
        cover: z.string().optional(),
        bio: z.string().max(200, "Bio must be at most 200 characters").optional(),
    }).refine(data => Object.keys(data).length > 0, {
        message: "At least one field must be provided to update",
    }),
};
