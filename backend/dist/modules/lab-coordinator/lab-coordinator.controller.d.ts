import { LabCoordinatorService } from './lab-coordinator.service';
export declare class LabCoordinatorController {
    private svc;
    constructor(svc: LabCoordinatorService);
    getCenter(req: any): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            email: string | null;
            phone: string | null;
            isActive: boolean;
            createdAt: Date;
            city: string | null;
            address: string;
            latitude: number | null;
            longitude: number | null;
            openTime: string;
            closeTime: string;
            workingDays: string[];
            homeCollection: boolean;
            collectionZones: string[];
            ownerId: string | null;
        } | null;
    }>;
    upsertCenter(req: any, body: any): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            email: string | null;
            phone: string | null;
            isActive: boolean;
            createdAt: Date;
            city: string | null;
            address: string;
            latitude: number | null;
            longitude: number | null;
            openTime: string;
            closeTime: string;
            workingDays: string[];
            homeCollection: boolean;
            collectionZones: string[];
            ownerId: string | null;
        };
    }>;
    getStats(req: any): Promise<{
        success: boolean;
        data: {
            total: number;
            todayCount: number;
            pending: number;
            homeCollection: number;
            reportReady: number;
            processing: number;
        };
    }>;
    getTests(req: any, q?: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        description: string | null;
        labCenterId: string | null;
        homeCollection: boolean;
        category: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        discountPct: number;
        turnaround: string | null;
        requiresFasting: boolean;
        sampleType: string | null;
        preparation: string | null;
    }[]>;
    createTest(req: any, body: any): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            description: string | null;
            labCenterId: string | null;
            homeCollection: boolean;
            category: string | null;
            price: import("@prisma/client/runtime/library").Decimal;
            discountPct: number;
            turnaround: string | null;
            requiresFasting: boolean;
            sampleType: string | null;
            preparation: string | null;
        };
    }>;
    updateTest(req: any, id: string, body: any): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            description: string | null;
            labCenterId: string | null;
            homeCollection: boolean;
            category: string | null;
            price: import("@prisma/client/runtime/library").Decimal;
            discountPct: number;
            turnaround: string | null;
            requiresFasting: boolean;
            sampleType: string | null;
            preparation: string | null;
        };
    }>;
    deleteTest(req: any, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getPackages(req: any): Promise<({
        items: ({
            test: {
                id: string;
                name: string;
                isActive: boolean;
                createdAt: Date;
                description: string | null;
                labCenterId: string | null;
                homeCollection: boolean;
                category: string | null;
                price: import("@prisma/client/runtime/library").Decimal;
                discountPct: number;
                turnaround: string | null;
                requiresFasting: boolean;
                sampleType: string | null;
                preparation: string | null;
            };
        } & {
            testId: string;
            packageId: string;
        })[];
    } & {
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        description: string | null;
        labCenterId: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        discountPct: number;
    })[]>;
    createPackage(req: any, body: any): Promise<{
        success: boolean;
        data: {
            items: ({
                test: {
                    id: string;
                    name: string;
                    isActive: boolean;
                    createdAt: Date;
                    description: string | null;
                    labCenterId: string | null;
                    homeCollection: boolean;
                    category: string | null;
                    price: import("@prisma/client/runtime/library").Decimal;
                    discountPct: number;
                    turnaround: string | null;
                    requiresFasting: boolean;
                    sampleType: string | null;
                    preparation: string | null;
                };
            } & {
                testId: string;
                packageId: string;
            })[];
        } & {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            description: string | null;
            labCenterId: string | null;
            price: import("@prisma/client/runtime/library").Decimal;
            discountPct: number;
        };
    }>;
    updatePackage(req: any, id: string, body: any): Promise<{
        success: boolean;
        data: {
            items: ({
                test: {
                    id: string;
                    name: string;
                    isActive: boolean;
                    createdAt: Date;
                    description: string | null;
                    labCenterId: string | null;
                    homeCollection: boolean;
                    category: string | null;
                    price: import("@prisma/client/runtime/library").Decimal;
                    discountPct: number;
                    turnaround: string | null;
                    requiresFasting: boolean;
                    sampleType: string | null;
                    preparation: string | null;
                };
            } & {
                testId: string;
                packageId: string;
            })[];
        } & {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            description: string | null;
            labCenterId: string | null;
            price: import("@prisma/client/runtime/library").Decimal;
            discountPct: number;
        };
    }>;
    deletePackage(req: any, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getBookings(req: any, status?: string, collectionType?: string, date?: string, page?: string, limit?: string): Promise<{
        success: boolean;
        data: ({
            patient: {
                id: string;
                name: string;
                email: string;
                phone: string | null;
            };
            test: {
                id: string;
                name: string;
                isActive: boolean;
                createdAt: Date;
                description: string | null;
                labCenterId: string | null;
                homeCollection: boolean;
                category: string | null;
                price: import("@prisma/client/runtime/library").Decimal;
                discountPct: number;
                turnaround: string | null;
                requiresFasting: boolean;
                sampleType: string | null;
                preparation: string | null;
            } | null;
            package: ({
                items: ({
                    test: {
                        id: string;
                        name: string;
                        isActive: boolean;
                        createdAt: Date;
                        description: string | null;
                        labCenterId: string | null;
                        homeCollection: boolean;
                        category: string | null;
                        price: import("@prisma/client/runtime/library").Decimal;
                        discountPct: number;
                        turnaround: string | null;
                        requiresFasting: boolean;
                        sampleType: string | null;
                        preparation: string | null;
                    };
                } & {
                    testId: string;
                    packageId: string;
                })[];
            } & {
                id: string;
                name: string;
                isActive: boolean;
                createdAt: Date;
                description: string | null;
                labCenterId: string | null;
                price: import("@prisma/client/runtime/library").Decimal;
                discountPct: number;
            }) | null;
        } & {
            id: string;
            createdAt: Date;
            status: string;
            notes: string | null;
            patientId: string;
            address: string | null;
            collectionType: string;
            scheduledAt: Date;
            amount: import("@prisma/client/runtime/library").Decimal;
            reportUrl: string | null;
            reportNote: string | null;
            reportUploadedAt: Date | null;
            patientNotified: boolean;
            phlebotomistName: string | null;
            phlebotomistPhone: string | null;
            testId: string | null;
            packageId: string | null;
            labCenterId: string | null;
        })[];
        total: number;
        pages: number;
    }>;
    updateStatus(req: any, id: string, body: {
        status: string;
    }): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            status: string;
            notes: string | null;
            patientId: string;
            address: string | null;
            collectionType: string;
            scheduledAt: Date;
            amount: import("@prisma/client/runtime/library").Decimal;
            reportUrl: string | null;
            reportNote: string | null;
            reportUploadedAt: Date | null;
            patientNotified: boolean;
            phlebotomistName: string | null;
            phlebotomistPhone: string | null;
            testId: string | null;
            packageId: string | null;
            labCenterId: string | null;
        };
    }>;
    assignPhlebotomist(req: any, id: string, body: {
        name: string;
        phone: string;
    }): Promise<{
        success: boolean;
        data: {
            patient: {
                id: string;
                name: string;
                phone: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            status: string;
            notes: string | null;
            patientId: string;
            address: string | null;
            collectionType: string;
            scheduledAt: Date;
            amount: import("@prisma/client/runtime/library").Decimal;
            reportUrl: string | null;
            reportNote: string | null;
            reportUploadedAt: Date | null;
            patientNotified: boolean;
            phlebotomistName: string | null;
            phlebotomistPhone: string | null;
            testId: string | null;
            packageId: string | null;
            labCenterId: string | null;
        };
    }>;
    uploadReport(req: any, id: string, body: {
        reportUrl: string;
        reportNote?: string;
    }): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            status: string;
            notes: string | null;
            patientId: string;
            address: string | null;
            collectionType: string;
            scheduledAt: Date;
            amount: import("@prisma/client/runtime/library").Decimal;
            reportUrl: string | null;
            reportNote: string | null;
            reportUploadedAt: Date | null;
            patientNotified: boolean;
            phlebotomistName: string | null;
            phlebotomistPhone: string | null;
            testId: string | null;
            packageId: string | null;
            labCenterId: string | null;
        };
    }>;
}
