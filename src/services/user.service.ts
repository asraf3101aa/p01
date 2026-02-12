import { db } from '../db';
import { users, roles, userRoles } from '../db/schema';
import { NewUser, User } from '../models/user.model';
import { eq, or, and } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { ROLES } from '../config/rbac.config';

export const createUser = async (user: NewUser): Promise<User | null> => {
  const hashedPassword = await bcrypt.hash(user.password, 10);

  return await db.transaction(async (tx) => {
    const [createdUser] = await tx
      .insert(users)
      .values({ ...user, password: hashedPassword })
      .returning();

    if (!createdUser) {
      return null;
    }

    const [userRole] = await tx
      .select()
      .from(roles)
      .where(eq(roles.name, ROLES.USER.name))
      .limit(1);

    if (userRole) {
      await tx.insert(userRoles).values({
        userId: createdUser.id,
        roleId: userRole.id,
      });
    }

    return createdUser;
  });
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

export const getUsers = async (): Promise<User[]> => {
  return db.select().from(users).where(eq(users.isDeleted, false));
};