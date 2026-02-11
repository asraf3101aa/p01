import { db } from '../db';
import { users } from '../db/schema';
import { NewUser, User } from '../models/user.model';
import { eq, or, and } from 'drizzle-orm';

export const createUser = async (user: NewUser): Promise<User> => {
  const [createdUser] = await db.insert(users).values(user).returning();
  if (!createdUser) {
    throw new Error('Failed to create user');
  }
  return createdUser;
};

export const getUserByIdentifier = async (
  identifier: string
): Promise<User | undefined> => {
  const [user] = await db
    .select()
    .from(users)
    .where(
      and(
        or(eq(users.email, identifier), eq(users.username, identifier)),
        eq(users.isActive, true),
        eq(users.isDeleted, false)
      )
    )
    .limit(1);

  return user;
};

export const getUserById = async (id: number): Promise<User | undefined> => {
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return user;
};

export const updateUserById = async (id: number, updateData: Partial<NewUser>): Promise<User | undefined> => {
  const [updatedUser] = await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, id))
    .returning();
  return updatedUser;
};

export const deleteUserById = async (id: number): Promise<User | undefined> => {
  const [deletedUser] = await db.delete(users).where(eq(users.id, id)).returning();
  return deletedUser;
};