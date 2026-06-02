import { MembershipService } from './membership.service';
import type { Request } from 'express';
export declare class MembershipController {
    private svc;
    constructor(svc: MembershipService);
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
    subscribe(req: Request, body: {
        planId: string;
    }): Promise<{
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
    myMembership(req: Request): Promise<({
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
    applyCoupon(body: {
        code: string;
        amount: number;
    }): Promise<{
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
    seed(): Promise<{
        plans: number;
        coupons: number;
    }>;
}
