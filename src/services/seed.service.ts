import { db } from '../db';
import { users, threads, roles, userRoles, threadImages, comments, threadLikes, threadSubscribers, notificationPreferences } from '../db/schema';
import bcrypt from 'bcrypt';
import { ROLES } from '../config/rbac.config';
import { eq } from 'drizzle-orm';
import { faker } from '@faker-js/faker';

export const seedDummyData = async () => {
    try {
        console.log('Seeding dummy data...');

        const userRole = await db.query.roles.findFirst({
            where: eq(roles.name, ROLES.USER.name),
        });

        if (!userRole) {
            console.error('User role not found. Please ensure RBAC is seeded first.');
            return;
        }

        const hashedPassword = await bcrypt.hash('password123', 10);
        const createdUsers = [];

        console.log('Generating 20 users...');
        for (let i = 1; i <= 20; i++) {
            const firstName = faker.person.firstName();
            const lastName = faker.person.lastName();
            const name = `${firstName} ${lastName}`;
            const username = faker.internet.username({ firstName, lastName }).toLowerCase() + '_' + faker.string.alphanumeric(4);
            const email = faker.internet.email({ firstName, lastName }).toLowerCase();

            const [newUser] = await db.insert(users).values({
                username,
                email,
                password: hashedPassword,
                name,
                bio: faker.lorem.sentence(),
                avatar: faker.image.avatar(),
                isEmailVerified: true,
            }).returning();

            if (newUser) {
                // Assign role
                await db.insert(userRoles).values({
                    userId: newUser.id,
                    roleId: userRole.id,
                });

                // Create notification preferences
                await db.insert(notificationPreferences).values({
                    userId: newUser.id,
                });

                createdUsers.push(newUser);
            }
        }
        console.log(`Created ${createdUsers.length} users with roles and preferences.`);

        const allInsertedThreads = [];

        console.log('Seeding threads for each user...');
        for (const user of createdUsers) {
            const numThreads = faker.number.int({ min: 10, max: 20 });
            const userThreads = [];
            for (let j = 1; j <= numThreads; j++) {
                userThreads.push({
                    content: faker.lorem.paragraphs(faker.number.int({ min: 1, max: 3 })),
                    authorId: user.id,
                });
            }

            // Batch insert threads for this user
            const insertedThreads = await db.insert(threads).values(userThreads).returning();

            // Auto-subscribe author to their own threads (matches service logic)
            const authorSubscriptions = insertedThreads.map(t => ({
                threadId: t.id,
                userId: user.id
            }));
            await db.insert(threadSubscribers).values(authorSubscriptions);

            // Add images to some threads
            const imageValues: { path: string; threadId: number }[] = [];
            for (const thread of insertedThreads) {
                if (faker.datatype.boolean(0.6)) {
                    const numImages = faker.number.int({ min: 1, max: 4 });
                    for (let k = 0; k < numImages; k++) {
                        imageValues.push({
                            path: faker.image.url(),
                            threadId: thread.id
                        });
                    }
                }
                allInsertedThreads.push(thread);
            }
            if (imageValues.length > 0) {
                await db.insert(threadImages).values(imageValues);
            }
        }
        console.log(`Created ${allInsertedThreads.length} threads total.`);

        console.log('Seeding interactions (likes, comments, extra subs)...');

        const interactionBatches: {
            likes: any[],
            comments: any[],
            subs: any[]
        } = { likes: [], comments: [], subs: [] };

        for (const thread of allInsertedThreads) {
            // Randomly pick some users to interact with this thread
            const potentialInteractors = faker.helpers.arrayElements(createdUsers, faker.number.int({ min: 0, max: 10 }));

            for (const interactor of potentialInteractors) {
                // Don't interact with own thread if duplicate unique constraint (for likes/subs)
                // Actually, threadLikes doesn't have a unique constraint in schema! Should it?
                // threadSubscribers doesn't have it either.

                // Random like
                if (faker.datatype.boolean(0.5)) {
                    interactionBatches.likes.push({
                        threadId: thread.id,
                        userId: interactor.id
                    });
                }

                // Random sub (if not author)
                if (interactor.id !== thread.authorId && faker.datatype.boolean(0.3)) {
                    interactionBatches.subs.push({
                        threadId: thread.id,
                        userId: interactor.id
                    });
                }

                // Random comment
                if (faker.datatype.boolean(0.4)) {
                    interactionBatches.comments.push({
                        threadId: thread.id,
                        authorId: interactor.id,
                        content: faker.lorem.sentence()
                    });
                }
            }

            // Periodically flush batches to avoid too large inserts
            if (interactionBatches.likes.length > 100) {
                await db.insert(threadLikes).values(interactionBatches.likes);
                interactionBatches.likes = [];
            }
            if (interactionBatches.comments.length > 100) {
                await db.insert(comments).values(interactionBatches.comments);
                interactionBatches.comments = [];
            }
            if (interactionBatches.subs.length > 100) {
                await db.insert(threadSubscribers).values(interactionBatches.subs);
                interactionBatches.subs = [];
            }
        }

        // Final flush
        if (interactionBatches.likes.length > 0) await db.insert(threadLikes).values(interactionBatches.likes);
        if (interactionBatches.comments.length > 0) await db.insert(comments).values(interactionBatches.comments);
        if (interactionBatches.subs.length > 0) await db.insert(threadSubscribers).values(interactionBatches.subs);

        console.log('Dummy data seeding completed successfully!');
    } catch (error) {
        console.error('Error seeding dummy data:', error);
    }
};
