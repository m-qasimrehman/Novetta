import { PrismaService } from '../../lib/prisma.service';
import type { Prisma } from '@prisma/client';
export declare class UsersRepository {
    private prisma;
    constructor(prisma: PrismaService);
    createUser(data: Prisma.UserCreateInput): Prisma.Prisma__UserClient<{
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
    findById(id: string): Prisma.Prisma__UserClient<{
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
}
