import { PrismaService } from '../../lib/prisma.service';
export declare class MembershipService {
    private prisma;
    constructor(prisma: PrismaService);
    listPlans(): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        discountPct: number;
        durationDays: number;
        features: string[];
        freeDelivery: boolean;
        maxAnnualSavings: import("@prisma/client/runtime/library").Decimal | null;
    }[]>;
    subscribe(userId: string, planId: string): Promise<{
        plan: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            description: string | null;
            price: import("@prisma/client/runtime/library").Decimal;
            discountPct: number;
            durationDays: number;
            features: string[];
            freeDelivery: boolean;
            maxAnnualSavings: import("@prisma/client/runtime/library").Decimal | null;
        };
    } & {
        id: string;
        createdAt: Date;
        expiresAt: Date;
        userId: string;
        status: string;
        startedAt: Date;
        planId: string;
    }>;
    myMembership(userId: string): Promise<({
        plan: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            description: string | null;
            price: import("@prisma/client/runtime/library").Decimal;
            discountPct: number;
            durationDays: number;
            features: string[];
            freeDelivery: boolean;
            maxAnnualSavings: import("@prisma/client/runtime/library").Decimal | null;
        };
    } & {
        id: string;
        createdAt: Date;
        expiresAt: Date;
        userId: string;
        status: string;
        startedAt: Date;
        planId: string;
    }) | null>;
    listCoupons(): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        expiresAt: Date | null;
        description: string | null;
        code: string;
        discountType: string;
        discountValue: import("@prisma/client/runtime/library").Decimal;
        minAmount: import("@prisma/client/runtime/library").Decimal | null;
        maxUses: number | null;
        usedCount: number;
    }[]>;
    applyCoupon(code: string, amount: number): Promise<{
        valid: boolean;
        discount: number;
        finalAmount: number;
        coupon: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            expiresAt: Date | null;
            description: string | null;
            code: string;
            discountType: string;
            discountValue: import("@prisma/client/runtime/library").Decimal;
            minAmount: import("@prisma/client/runtime/library").Decimal | null;
            maxUses: number | null;
            usedCount: number;
        };
    }>;
    seedPlans(): Promise<{
        plans: number;
        coupons: number;
    }>;
}
