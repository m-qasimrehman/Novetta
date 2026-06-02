import { PrismaService } from '../../lib/prisma.service';
export declare class ProfileService {
    private prisma;
    constructor(prisma: PrismaService);
    getFullProfile(userId: string): Promise<{
        success: boolean;
        data: any;
    }>;
    updateProfile(userId: string, data: {
        name?: string;
        phone?: string;
    }): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            email: string;
            phone: string | null;
            role: string;
            isVerified: boolean;
            createdAt: Date;
        };
    }>;
    addMedicalHistory(userId: string, data: {
        condition: string;
        diagnosedAt?: string;
        notes?: string;
    }): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            notes: string | null;
            patientId: string;
            condition: string;
            diagnosedAt: Date | null;
            isCurrent: boolean;
        };
    }>;
    listMedicalHistory(userId: string): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            notes: string | null;
            patientId: string;
            condition: string;
            diagnosedAt: Date | null;
            isCurrent: boolean;
        }[];
    }>;
    deleteMedicalHistory(id: string, userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    addDependent(userId: string, data: {
        name: string;
        relationship: string;
        dateOfBirth?: string;
        gender?: string;
        bloodGroup?: string;
    }): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            createdAt: Date;
            userId: string;
            relationship: string;
            dateOfBirth: Date | null;
            gender: string | null;
            bloodGroup: string | null;
        };
    }>;
    listDependents(userId: string): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            createdAt: Date;
            userId: string;
            relationship: string;
            dateOfBirth: Date | null;
            gender: string | null;
            bloodGroup: string | null;
        }[];
    }>;
    deleteDependent(id: string, userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    listAddresses(userId: string): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            userId: string;
            city: string | null;
            address: string;
            label: string;
            isDefault: boolean;
        }[];
    }>;
    addAddress(userId: string, data: {
        label: string;
        address: string;
        city?: string;
        isDefault?: boolean;
    }): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            userId: string;
            city: string | null;
            address: string;
            label: string;
            isDefault: boolean;
        };
    }>;
    setDefaultAddress(id: string, userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    deleteAddress(id: string, userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
