import { ProfileService } from './profile.service';
export declare class ProfileController {
    private profileService;
    constructor(profileService: ProfileService);
    getProfile(req: any): Promise<{
        success: boolean;
        data: any;
    }>;
    updateProfile(body: {
        name?: string;
        phone?: string;
    }, req: any): Promise<{
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
    listHistory(req: any): Promise<{
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
    addHistory(body: {
        condition: string;
        diagnosedAt?: string;
        notes?: string;
    }, req: any): Promise<{
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
    deleteHistory(id: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    listDependents(req: any): Promise<{
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
    addDependent(body: {
        name: string;
        relationship: string;
        dateOfBirth?: string;
        gender?: string;
        bloodGroup?: string;
    }, req: any): Promise<{
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
    deleteDependent(id: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    listAddresses(req: any): Promise<{
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
    addAddress(body: {
        label: string;
        address: string;
        city?: string;
        isDefault?: boolean;
    }, req: any): Promise<{
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
    setDefault(id: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    deleteAddress(id: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
