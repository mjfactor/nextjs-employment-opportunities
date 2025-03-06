import { verifyPassword } from '../auth/hashPassword';
import { prisma } from '../../prisma/prisma';

export async function getUserFromDb(email: string, password: string) {
    // 1. Find the user by email
    const user = await prisma.user.findUnique({
        where: { email },
    });

    // 2. If no user found, return null
    if (!user || !user.password) return null; // Check if password exists

    // 3. Verify the password matches
    const passwordValid = await verifyPassword(password, user.password);

    // 4. If password doesn't match, return null
    if (!passwordValid) return null;

    // 5. Return user without the password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
}