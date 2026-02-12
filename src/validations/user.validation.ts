import z from "zod";

export const getProfileById = {
    params: z.object({
        id: z.coerce.number("Invalid user ID"),
    }),
};
