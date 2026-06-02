import { NotificationsService } from './notifications.service';
import type { Request } from 'express';
export declare class NotificationsController {
    private svc;
    constructor(svc: NotificationsService);
    list(req: Request): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        title: string;
        body: string;
        type: string;
        isRead: boolean;
        link: string | null;
    }[]>;
    unreadCount(req: Request): Promise<{
        count: number;
    }>;
    markRead(id: string, req: Request): Promise<import(".prisma/client").Prisma.BatchPayload>;
    markAllRead(req: Request): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
