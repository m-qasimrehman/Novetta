import { PrismaService } from '../../lib/prisma.service';
export declare class ChatService {
    private prisma;
    constructor(prisma: PrismaService);
    private checkPatientGuardrail;
    getConversation(userId: string, partnerId: string): Promise<{
        success: boolean;
        data: {
            isMine: boolean;
            sender: {
                id: string;
                name: string;
            };
            message: string | null;
            id: string;
            createdAt: Date;
            receiverId: string;
            senderId: string;
        }[];
    }>;
    sendMessage(senderId: string, receiverId: string, message: string): Promise<{
        success: boolean;
        data: {
            sender: {
                id: string;
                name: string;
            };
        } & {
            message: string | null;
            id: string;
            createdAt: Date;
            receiverId: string;
            senderId: string;
        };
    }>;
    getMessageCount(patientId: string, doctorUserId: string): Promise<{
        success: boolean;
        data: {
            count: number;
            hasActiveAppt: boolean;
            limit: number;
        };
    }>;
}
