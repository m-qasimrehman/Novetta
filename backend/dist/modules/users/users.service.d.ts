import { UsersRepository } from './users.repository';
import type { Prisma } from '@prisma/client';
export declare class UsersService {
    private usersRepo;
    constructor(usersRepo: UsersRepository);
    createUser(payload: {
        name: string;
        email: string;
        phone?: string;
        password: string;
        role?: string;
    }): Promise<{
        id: string;
        name: string;
        email: string;
        phone: string | null;
        passwordHash: string;
        role: string;
        isVerified: boolean;
        isActive: boolean;
        createdAt: Date;
    }>;
    findByEmail(email: string): Prisma.Prisma__UserClient<{
        id: string;
        name: string;
        email: string;
        phone: string | null;
        passwordHash: string;
        role: string;
        isVerified: boolean;
        isActive: boolean;
        createdAt: Date;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    findByPhone(phone: string): Prisma.Prisma__UserClient<{
        id: string;
        name: string;
        email: string;
        phone: string | null;
        passwordHash: string;
        role: string;
        isVerified: boolean;
        isActive: boolean;
        createdAt: Date;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    findById(id: string): Promise<{
        [key: string]: any;
    } | null>;
    update(id: string, data: Prisma.UserUpdateInput): Prisma.Prisma__UserClient<{
        id: string;
        name: string;
        email: string;
        phone: string | null;
        passwordHash: string;
        role: string;
        isVerified: boolean;
        isActive: boolean;
        createdAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    sanitize(user: {
        passwordHash: string;
        [key: string]: any;
    }): {
        [key: string]: any;
    };
}
