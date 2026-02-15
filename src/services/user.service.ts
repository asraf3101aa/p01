import { db } from '../db';
import { users, roles, userRoles } from '../db/schema';
import { NewUser } from '../models/user.model';
import { eq, or, and } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { ROLES } from '../config/rbac.config';
import { serviceError } from '../utils/serviceError';

export const createUser = async (user: NewUser) => {
  try {
    const hashedPassword = await bcrypt.hash(user.password, 10);

    const createdUser = await db.transaction(async (tx) => {
      const [newUser] = await tx
        .insert(users)
        .values({ ...user, password: hashedPassword })
        .returning();

      if (!newUser) throw new Error('Failed to create user');

      const [userRole] = await tx
        .select()
        .from(roles)
        .where(eq(roles.name, ROLES.USER.name))
        .limit(1);

      if (userRole) {
        await tx.insert(userRoles).values({
          userId: newUser.id,
          roleId: userRole.id,
        });
      }

      return newUser;
    });

    return { user: createdUser, message: 'User created successfully' };
  } catch (error: any) {
    return { user: null, ...serviceError(error, 'Failed to create user') };
  }
};

export const getUserByIdentifier = async (identifier: string) => {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(
        and(
          or(eq(users.email, identifier), eq(users.username, identifier))
        )
      )
      .limit(1);

    if (!user) return { user: null, message: 'User not found' };
    return { user, message: 'User retrieved successfully' };
  } catch (error: any) {
    return { user: null, ...serviceError(error, 'Failed to get user') };
  }
};

export const getUserById = async (id: number) => {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.id, id), eq(users.isDeleted, false), eq(users.isActive, true)))
      .limit(1);

    if (!user) return { user: null, message: 'User not found' };
    return { user, message: 'User retrieved successfully' };
  } catch (error: any) {
    return { user: null, ...serviceError(error, 'Failed to get user') };
  }
};

export const updateUserById = async (id: number, updateData: Partial<NewUser>) => {
  try {
    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();

    if (!updatedUser) return { user: null, message: 'User not found or not updated' };
    return { user: updatedUser, message: 'User updated successfully' };
  } catch (error: any) {
    return { user: null, ...serviceError(error, 'Failed to update user') };
  }
};

export const deleteUserById = async (id: number) => {
  try {
    const [deletedUser] = await db.delete(users).where(eq(users.id, id)).returning();
    if (!deletedUser) return { user: null, message: 'User not found or already deleted' };
    return { user: deletedUser, message: 'User deleted successfully' };
  } catch (error: any) {
    return { user: null, ...serviceError(error, 'Failed to delete user') };
  }
};