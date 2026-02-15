import { seedDummyData } from '../services/seed.service';
import { seedRBAC } from '../services/rbac.service';

const runSeed = async () => {
    try {
        console.log('--- Starting Database Seeding ---');

        // Ensure RBAC is seeded first so roles exist
        await seedRBAC();

        // Seed dummy users and threads
        await seedDummyData();

        console.log('--- Seeding Completed ---');
        process.exit(0);
    } catch (error) {
        console.error('--- Seeding Failed ---', error);
        process.exit(1);
    }
};

runSeed();
