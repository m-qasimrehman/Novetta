import { LabsService } from './labs.service';
import type { Request } from 'express';
export declare class LabsController {
    private labs;
    constructor(labs: LabsService);
    listTests(category?: string, q?: string): Promise<({
        labCenter: {
            id: string;
            name: string;
            city: string | null;
        } | null;
    } & {
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
    })[]>;
    getTest(id: string): Promise<{
        labCenter: {
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
    } & {
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
    }>;
    listPackages(labCenterId?: string): Promise<({
        labCenter: {
            id: string;
            name: string;
            city: string | null;
        } | null;
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
    listCenters(city?: string): Promise<{
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
    }[]>;
    bookTest(req: Request, dto: any): Promise<{
        labCenter: {
            id: string;
            name: string;
            address: string;
        } | null;
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
    }>;
    myBookings(req: Request): Promise<({
        labCenter: {
            id: string;
            name: string;
            phone: string | null;
            address: string;
        } | null;
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
    })[]>;
    cancelBooking(id: string, req: Request): Promise<{
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
    }>;
    cancelBookingPatch(id: string, req: Request): Promise<{
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
    }>;
    seed(): Promise<{
        seeded: number;
    }>;
}
