const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createAdminUser() {
    try {
        const hashedPassword = await bcrypt.hash('admin123', 12);
        
        const adminUser = await prisma.user.create({
            data: {
                username: 'admin',
                email: 'admin@example.com',
                password: hashedPassword,
                role: 'admin',
                createdAt: new Date()
            }
        });
        
        console.log('Admin user created successfully:', adminUser);
    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createAdminUser(); 