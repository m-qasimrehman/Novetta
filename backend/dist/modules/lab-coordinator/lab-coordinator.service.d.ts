import { PrismaService } from '../../lib/prisma.service';
export declare class LabCoordinatorService {
    private prisma;
    constructor(prisma: PrismaService);
    private assertCoordinator;
    private getCenter;
    getMyCenter(userId: string): Promise<{
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
    upsertCenter(userId: string, data: {
        name: string;
        address: string;
        city?: string;
        latitude?: number;
        longitude?: number;
        phone?: string;
        email?: string;
        openTime?: string;
        closeTime?: string;
        workingDays?: string[];
        homeCollection?: boolean;
        collectionZones?: string[];
    }): Promise<{
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
    getStats(userId: string): Promise<{
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
    getTests(userId: string, q?: string): Promise<{
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
    createTest(userId: string, data: {
        name: string;
        description?: string;
        category?: string;
        price: number;
        discountPct?: number;
        turnaround?: string;
        homeCollection?: boolean;
        requiresFasting?: boolean;
        sampleType?: string;
        preparation?: string;
    }): Promise<{
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
    updateTest(userId: string, testId: string, data: Partial<{
        name: string;
        description: string;
        category: string;
        price: number;
        discountPct: number;
        turnaround: string;
        homeCollection: boolean;
        requiresFasting: boolean;
        sampleType: string;
        preparation: string;
        isActive: boolean;
    }>): Promise<{
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
    deleteTest(userId: string, testId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getPackages(userId: string): Promise<({
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
    createPackage(userId: string, data: {
        name: string;
        description?: string;
        price: number;
        discountPct?: number;
        testIds: string[];
    }): Promise<{
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
    updatePackage(userId: string, packageId: string, data: Partial<{
        name: string;
        description: string;
        price: number;
        discountPct: number;
        isActive: boolean;
        testIds: string[];
    }>): Promise<{
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
    deletePackage(userId: string, packageId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getBookings(userId: string, filters: {
        status?: string;
        collectionType?: string;
        date?: string;
        page?: number;
        limit?: number;
    }): Promise<{
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
    updateBookingStatus(userId: string, bookingId: string, status: string): Promise<{
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
    assignPhlebotomist(userId: string, bookingId: string, name: string, phone: string): Promise<{
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
    uploadReport(userId: string, bookingId: string, reportUrl: string, reportNote?: string): Promise<{
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
