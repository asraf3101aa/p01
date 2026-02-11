import { userLoggedInDevices, users } from "../db/schema";

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type UserLoggedInDevice = typeof userLoggedInDevices.$inferSelect;
export type NewUserLoggedInDevice = typeof userLoggedInDevices.$inferInsert;
