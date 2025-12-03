import prisma from '../config/database';
import { ApiError } from '../utils/ApiError';
import { User } from '@prisma/client';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export class UserService {
    async getAllUsers() {
        try {
            return await prisma.user.findMany({
                select: {
                    id: true,
                    email: true,
                    username: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });
        } catch (error) {

            console.log(error);
            return []

        }
    }

    async getUserById(id: string): Promise<User> {
        try {
            const user = await prisma.user.findUnique({
                where: { id },
            });

            if (!user) {
                throw ApiError.notFound(`User with ID ${id} not found`);
            }

            return user;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async getUserByUsername(username: string) {
        try {
            const user = await prisma.user.findUnique({
                where: { username },
                select: {
                    id: true,
                    email: true,
                    username: true,
                    createdAt: true,
                    updatedAt: true,
                }
            });

            if (!user) {
                throw ApiError.notFound(`User with username ${username} not found`);
            }

            return user;
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }

    async getUserByEmail(email: string): Promise<User> {
        try {
            const user = await prisma.user.findUnique({
                where: { email },
            });

            if (!user) {
                throw ApiError.notFound(`User with email ${email} not found`);
            }

            return user;
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }

    async createUser(data: { username: string; email: string; password: string }) {
        try {
            // Check for existing email
            const existingEmail = await prisma.user.findUnique({
                where: { email: data.email },
            });

            if (existingEmail) {
                throw ApiError.conflict('User with this email already exists');
            }

            // Check for existing username
            const existingUsername = await prisma.user.findUnique({
                where: { username: data.username },
            });

            if (existingUsername) {
                throw ApiError.conflict('User with this username already exists');
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

            return await prisma.user.create({
                data: {
                    username: data.username,
                    email: data.email,
                    password: hashedPassword,
                },
                select: {
                    id: true,
                    email: true,
                    username: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }

    async updateUser(
        id: string,
        data: { email?: string; password?: string, username?: string }
    ) {
        try {
            const user = await this.getUserById(id);

            // Check for email conflicts
            if (data.email && data.email !== user.email) {
                const existingUser = await prisma.user.findUnique({
                    where: { email: data.email },
                });

                if (existingUser) {
                    throw ApiError.conflict('User with this email already exists');
                }
            }
            if (data.username && data.username !== user.username) {
                const existingUser = await prisma.user.findUnique({
                    where: { username: data.username },
                });

                if (existingUser) {
                    throw ApiError.conflict('User with this username already exists');
                }
            }

            // Hash password if provided
            const updateData: { email?: string; password?: string, username?: string } = {};
            if (data.email) {
                updateData.email = data.email;
            }
            if (data.username) {
                updateData.username = data.username;
            }
            if (data.password) {
                updateData.password = await bcrypt.hash(data.password, SALT_ROUNDS);
            }
            console.log({ updateData });
            console.log({ data });


            return await prisma.user.update({
                where: { id },
                data: updateData,
                select: {
                    id: true,
                    email: true,
                    username: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async deleteUser(id: string): Promise<User> {
        await this.getUserById(id);

        return await prisma.user.delete({
            where: { id },
        });
    }
}

export const userService = new UserService();
