import { MedicalRecordsService } from './medical-records.service';
export declare class MedicalRecordsController {
    private medicalRecordsService;
    constructor(medicalRecordsService: MedicalRecordsService);
    list(req: any): Promise<{
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
    create(body: {
        title: string;
        description?: string;
        recordType?: string;
        fileUrl?: string;
    }, req: any): Promise<{
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
    delete(id: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
