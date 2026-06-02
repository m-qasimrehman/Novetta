import { ChatService } from './chat.service';
export declare class ChatController {
    private chatService;
    constructor(chatService: ChatService);
    getConversation(partnerId: string, req: any): Promise<{
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
    sendMessage(body: {
        receiverId: string;
        message: string;
    }, req: any): Promise<{
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
    getLimit(doctorUserId: string, req: any): Promise<{
        success: boolean;
        data: {
            count: number;
            hasActiveAppt: boolean;
            limit: number;
        };
    }>;
}
