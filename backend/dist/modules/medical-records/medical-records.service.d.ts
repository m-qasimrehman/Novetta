import { PrismaService } from '../../lib/prisma.service';
export declare class MedicalRecordsService {
    private prisma;
    constructor(prisma: PrismaService);
    list(patientId: string): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            patientId: string;
            title: string | null;
            description: string | null;
            fileUrl: string | null;
            recordType: string | null;
        }[];
    }>;
    create(patientId: string, data: {
        title: string;
        description?: string;
        recordType?: string;
        fileUrl?: string;
    }): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            patientId: string;
            title: string | null;
            description: string | null;
            fileUrl: string | null;
            recordType: string | null;
        };
    }>;
    delete(id: string, patientId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
