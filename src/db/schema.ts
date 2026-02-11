import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  firstName: text('first_name',{ length: 20 }).notNull(),
  lastName: text('last_name',{ length: 20 }),
  email: text('email').notNull().unique(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  dateJoined: integer('date_joined', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull(),

  phoneNumber: text('phone_number').unique(),
  isDeleted: integer('is_deleted', { mode: 'boolean' }).default(false).notNull(),
  
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
});

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