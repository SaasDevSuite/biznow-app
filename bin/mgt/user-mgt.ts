#!/usr/bin/env ts-node

import {PrismaClient, Role} from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminUser(username: string, email: string, password: string, name?: string) {
    // Hash the password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the admin user with role ADMIN and isActive true
    return prisma.user.create({
        data: {
            username,
            email,
            password: hashedPassword,
            name: name || null,
            role: Role.ADMIN,
            isActive: true,
        },
    });
}

async function main() {
    // Retrieve command-line arguments
    // Expected usage: ts-node createAdmin.ts <username> <email> <password> [name]
    const args = process.argv.slice(2);
    if (args.length < 3) {
        console.error("Usage: ts-node createAdmin.ts <username> <email> <password> [name]");
        process.exit(1);
    }
    const [username, email, password, name] = args;

    try {
        const adminUser = await createAdminUser(username, email, password, name);
        console.log("Admin user created successfully:");
        console.log(adminUser);
    } catch (error) {
        console.error("Error creating admin user:", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
