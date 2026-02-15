import { db } from '../db';
import { users, threads, roles, userRoles, threadImages } from '../db/schema';
import bcrypt from 'bcrypt';
import { ROLES } from '../config/rbac.config';
import { eq } from 'drizzle-orm';
import { faker } from '@faker-js/faker';

export const seedDummyData = async () => {
    try {
        console.log('Seeding dummy data...');

        // 1. Get User Role
        const userRole = await db.query.roles.findFirst({
            where: eq(roles.name, ROLES.USER.name),
        });

        if (!userRole) {
            console.error('User role not found. Please ensure RBAC is seeded first.');
            return;
        }

        const hashedPassword = await bcrypt.hash('password123', 10);
        const createdUsers = [];

        // Create 20 Users
        console.log('Generating 20 users...');
        for (let i = 1; i <= 20; i++) {
            const firstName = faker.person.firstName();
            const lastName = faker.person.lastName();
            const username = faker.internet.username({ firstName, lastName }).toLowerCase() + Math.floor(Math.random() * 100);
            const email = faker.internet.email({ firstName, lastName }).toLowerCase();

            const [newUser] = await db.insert(users).values({
                username,
                email,
                password: hashedPassword,
                firstName,
                lastName,
            }).returning();

            if (newUser) {
                await db.insert(userRoles).values({
                    userId: newUser.id,
                    roleId: userRole.id,
                });
                createdUsers.push(newUser);
            }
        }
        console.log(`Created ${createdUsers.length} users.`);

        // 2. Create 30 Threads for each user
        console.log('Seeding 30 threads for each user...');
        for (const user of createdUsers) {
            const userThreads = [];
            for (let j = 1; j <= 30; j++) {
                userThreads.push({
                    title: faker.lorem.sentence({ min: 3, max: 10 }),
                    content: faker.lorem.paragraphs(Math.floor(Math.random() * 3) + 1),
                    authorId: user.id,
                });
            }

            // Batch insert threads for this user
            const insertedThreads = await db.insert(threads).values(userThreads).returning();

            // Add images to some threads
            const imageValues: { path: string; threadId: number }[] = [];
            for (const thread of insertedThreads) {
                if (Math.random() > 0.5) {
                    const numImages = Math.floor(Math.random() * 3) + 1;
                    for (let k = 0; k < numImages; k++) {
                        imageValues.push({
                            path: faker.image.url(),
                            threadId: thread.id
                        });
                    }
                }
            }
            if (imageValues.length > 0) {
                await db.insert(threadImages).values(imageValues);
            }

            console.log(`Created 30 threads for ${user.username}`);
        }

        console.log('Dummy data seeding completed successfully!');
    } catch (error) {
        console.error('Error seeding dummy data:', error);
    }
};
