import { PrismaService } from '../../lib/prisma.service';
export declare class NotificationsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, data: {
        title: string;
        body: string;
        type?: string;
        link?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        title: string;
        body: string;
        type: string;
        isRead: boolean;
        link: string | null;
    }>;
    list(userId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        title: string;
        body: string;
        type: string;
        isRead: boolean;
        link: string | null;
    }[]>;
    unreadCount(userId: string): Promise<{
        count: number;
    }>;
    markRead(id: string, userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    markAllRead(userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
