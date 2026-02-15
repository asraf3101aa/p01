import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql, relations } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  name: text('name', { length: 100 }).notNull(),
  email: text('email').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  dateJoined: integer('date_joined', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull(),

  avatarPath: text('avatar_path'),
  coverPath: text('cover_path'),
  bio: text('bio'),
  isDeleted: integer('is_deleted', { mode: 'boolean' }).default(false).notNull(),

  isEmailVerified: integer('is_email_verified', { mode: 'boolean' }).default(false).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
});

export const emailVerificationTokens = sqliteTable('email_verification_tokens', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  token: text('token').notNull(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  threads: many(threads),
  comments: many(comments),
  likes: many(threadLikes),
  subscriptions: many(threadSubscribers),
}));

export const userLoggedInDevices = sqliteTable('user_logged_in_devices', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  deviceToken: text('device_token').notNull(),
  deviceName: text('device_name'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull(),
});

export const roles = sqliteTable('roles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  description: text('description'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull(),
});

export const permissions = sqliteTable('permissions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  description: text('description'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull(),
});

export const rolePermissions = sqliteTable('role_permissions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  roleId: integer('role_id')
    .references(() => roles.id, { onDelete: 'cascade' })
    .notNull(),
  permissionId: integer('permission_id')
    .references(() => permissions.id, { onDelete: 'cascade' })
    .notNull(),
});

export const userRoles = sqliteTable('user_roles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  roleId: integer('role_id')
    .references(() => roles.id, { onDelete: 'cascade' })
    .notNull(),
});

export const threads = sqliteTable('threads', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  content: text('content').notNull(),
  authorId: integer('author_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  isDeleted: integer('is_deleted', { mode: 'boolean' }).default(false).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
});

export const threadImages = sqliteTable('thread_images', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  path: text('path').notNull(),
  threadId: integer('thread_id')
    .references(() => threads.id, { onDelete: 'cascade' })
    .notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull(),
});

export const threadImagesRelations = relations(threadImages, ({ one }) => ({
  thread: one(threads, {
    fields: [threadImages.threadId],
    references: [threads.id],
  }),
}));

export const threadsRelations = relations(threads, ({ one, many }) => ({
  author: one(users, {
    fields: [threads.authorId],
    references: [users.id],
  }),
  comments: many(comments),
  likes: many(threadLikes),
  subscribers: many(threadSubscribers),
  imagePaths: many(threadImages),
}));

export const comments = sqliteTable('comments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  content: text('content').notNull(),
  threadId: integer('thread_id')
    .references(() => threads.id, { onDelete: 'cascade' })
    .notNull(),
  authorId: integer('author_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
});

export const commentsRelations = relations(comments, ({ one }) => ({
  thread: one(threads, {
    fields: [comments.threadId],
    references: [threads.id],
  }),
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
}));

export const threadSubscribers = sqliteTable('thread_subscribers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  threadId: integer('thread_id')
    .references(() => threads.id, { onDelete: 'cascade' })
    .notNull(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull(),
});

export const threadSubscribersRelations = relations(threadSubscribers, ({ one }) => ({
  thread: one(threads, {
    fields: [threadSubscribers.threadId],
    references: [threads.id],
  }),
  user: one(users, {
    fields: [threadSubscribers.userId],
    references: [users.id],
  }),
}));

export const threadLikes = sqliteTable('thread_likes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  threadId: integer('thread_id')
    .references(() => threads.id, { onDelete: 'cascade' })
    .notNull(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull(),
});

export const threadLikesRelations = relations(threadLikes, ({ one }) => ({
  thread: one(threads, {
    fields: [threadLikes.threadId],
    references: [threads.id],
  }),
  user: one(users, {
    fields: [threadLikes.userId],
    references: [users.id],
  }),
}));

export const notificationPreferences = sqliteTable('notification_preferences', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  emailEnabled: integer('email_enabled', { mode: 'boolean' }).default(true).notNull(),
  inAppEnabled: integer('in_app_enabled', { mode: 'boolean' }).default(true).notNull(),
  smsEnabled: integer('sms_enabled', { mode: 'boolean' }).default(true).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
});

export const notifications = sqliteTable('notifications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  isRead: integer('is_read', { mode: 'boolean' }).default(false).notNull(),
  type: text('type').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull(),
});