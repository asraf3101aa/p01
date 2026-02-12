import { threads, comments, threadSubscribers } from "../db/schema";

export type Thread = typeof threads.$inferSelect;
export type NewThread = typeof threads.$inferInsert;

export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;

export type ThreadSubscriber = typeof threadSubscribers.$inferSelect;
export type NewThreadSubscriber = typeof threadSubscribers.$inferInsert;
