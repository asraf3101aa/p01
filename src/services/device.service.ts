import { eq } from 'drizzle-orm';
import { db } from '../db';
import { userLoggedInDevices } from '../db/schema';
import { NewUserLoggedInDevice, UserLoggedInDevice } from '../models/user.model';

export const createDevice = async (device: NewUserLoggedInDevice): Promise<UserLoggedInDevice> => {
  const [newDevice] = await db.insert(userLoggedInDevices).values(device).returning();
  if (!newDevice) {
    throw new Error('Failed to create device');
  }
  return newDevice;
};

export const getDevicesByUserId = async (userId: number): Promise<UserLoggedInDevice[]> => {
  return db.select().from(userLoggedInDevices).where(eq(userLoggedInDevices.userId, userId));
};

export const deleteDevicebyToken = async (token: string): Promise<void> => {
  await db.delete(userLoggedInDevices).where(eq(userLoggedInDevices.deviceToken, token));
};
