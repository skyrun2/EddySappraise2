import prisma from '../config/database';
import { ApiError } from '../utils/ApiError';
import { User } from '@prisma/client';

export class UserService {
    async getAllUsers(): Promise<User[]> {
        return await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    async getUserById(id: string): Promise<User> {
        const user = await prisma.user.findUnique({
            where: { id },
        });

        if (!user) {
            throw ApiError.notFound(`User with id ${id} not found`);
        }

        return user;
    }

    async createUser(data: { email: string; password: string }): Promise<User> {
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (existingUser) {
            throw ApiError.conflict('User with this email already exists');
        }

        return await prisma.user.create({
            data,
        });
    }

    async updateUser(
        id: string,
        data: { email?: string; password?: string }
    ): Promise<User> {
        const user = await this.getUserById(id);

        if (data.email && data.email !== user.email) {
            const existingUser = await prisma.user.findUnique({
                where: { email: data.email },
            });

            if (existingUser) {
                throw ApiError.conflict('User with this email already exists');
            }
        }

        return await prisma.user.update({
            where: { id },
            data,
        });
    }

    async deleteUser(id: string): Promise<User> {
        await this.getUserById(id);

        return await prisma.user.delete({
            where: { id },
        });
    }
}

export const userService = new UserService();
