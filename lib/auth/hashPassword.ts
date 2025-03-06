import bcrypt from 'bcrypt';

// For hashing new passwords during registration
export async function saltAndHashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
}

// For comparing passwords during login
export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
}