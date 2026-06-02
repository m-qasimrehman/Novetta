import { AdminService } from './admin.service';
import type { Request } from 'express';
export declare class AdminController {
    private svc;
    constructor(svc: AdminService);
    stats(req: Request, dateFrom?: string, dateTo?: string): Promise<{
        success: boolean;
        data: {
            users: number;
            doctors: number;
            appointments: number;
            orders: number;
            labBookings: number;
            memberships: number;
            couponUsage: number;
        };
    }>;
    revenue(req: Request): Promise<{
        success: boolean;
        data: {
            pharmacy: number;
            labs: number;
            memberships: number;
            total: number;
            monthlyChart: {
                month: string;
                amount: number;
            }[];
        };
    }>;
    listUsers(req: Request, page?: string, limit?: string, role?: string, q?: string): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            email: string;
            phone: string | null;
            role: string;
            isVerified: boolean;
            isActive: boolean;
            createdAt: Date;
        }[];
        total: number;
        page: number;
        pages: number;
    }>;
    toggleUser(id: string, req: Request): Promise<{
        success: boolean;
        data: {
            id: string;
            isActive: boolean;
        };
    }>;
    listDoctors(req: Request): Promise<{
        success: boolean;
        data: ({
            user: {
                name: string;
                email: string;
                isActive: boolean;
            };
        } & {
            id: string;
            isVerified: boolean;
            createdAt: Date;
            userId: string;
            specialization: string | null;
            qualification: string | null;
            experience: number;
            rating: import("@prisma/client/runtime/library").Decimal;
            totalReviews: number;
            isOnline: boolean;
            verifiedAt: Date | null;
            about: string | null;
            consultationFee: import("@prisma/client/runtime/library").Decimal | null;
            city: string | null;
            location: string | null;
            languages: string[];
            consultationTypes: string[];
            imageUrl: string | null;
            homeVisits: boolean;
            homeVisitAreas: string[];
            certificationUrls: string[];
        })[];
    }>;
    verifyDoctor(id: string, req: Request): Promise<{
        success: boolean;
        data: {
            id: string;
            isVerified: boolean;
            userId: string;
            verifiedAt: Date | null;
        };
    }>;
    listPlans(req: Request): Promise<{
        success: boolean;
        data: ({
            _count: {
                subscriptions: number;
            };
        } & {
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
        })[];
    }>;
    createPlan(body: any, req: Request): Promise<{
        success: boolean;
        data: {
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
    }>;
    updatePlan(id: string, body: any, req: Request): Promise<{
        success: boolean;
        data: {
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
    }>;
    deletePlan(id: string, req: Request): Promise<{
        success: boolean;
        message: string;
    }>;
    membershipStats(req: Request): Promise<{
        success: boolean;
        data: {
            active: number;
            total: number;
            churnRate: string;
            plans: {
                id: string;
                name: string;
                price: number;
                subscribers: number;
            }[];
        };
    }>;
    listCoupons(req: Request): Promise<{
        success: boolean;
        data: {
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
        }[];
    }>;
    createCoupon(body: any, req: Request): Promise<{
        success: boolean;
        data: {
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
    updateCoupon(id: string, body: any, req: Request): Promise<{
        success: boolean;
        data: {
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
    deleteCoupon(id: string, req: Request): Promise<{
        success: boolean;
        message: string;
    }>;
    listAllAppointments(req: Request, status?: string, page?: string): Promise<{
        success: boolean;
        data: ({
            doctor: {
                user: {
                    name: string;
                };
                specialization: string | null;
            };
            patient: {
                name: string;
                email: string;
            };
        } & {
            id: string;
            createdAt: Date;
            appointmentDate: Date | null;
            status: string;
            consultationType: string | null;
            reason: string | null;
            notes: string | null;
            paymentStatus: string;
            paymentAmount: import("@prisma/client/runtime/library").Decimal | null;
            confirmationCode: string | null;
            doctorId: string;
            slotId: string | null;
            patientId: string;
        })[];
        total: number;
        page: number;
        pages: number;
    }>;
    listAllOrders(req: Request, type?: string, page?: string): Promise<{
        success: boolean;
        data: {
            orderType: string;
            patient: {
                name: string;
                email: string;
            };
            test: {
                name: string;
                price: import("@prisma/client/runtime/library").Decimal;
            } | null;
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
        }[];
        total: number;
    } | {
        success: boolean;
        data: {
            orderType: string;
            patient: {
                name: string;
                email: string;
            };
            items: ({
                medicine: {
                    name: string;
                };
            } & {
                id: string;
                price: import("@prisma/client/runtime/library").Decimal;
                orderId: string;
                medicineId: string;
                quantity: number;
            })[];
            id: string;
            createdAt: Date;
            status: string;
            notes: string | null;
            patientId: string;
            deliveryType: string;
            address: string | null;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            prescriptionStatus: string | null;
            prescriptionNote: string | null;
            prescriptionId: string | null;
            pharmacyId: string | null;
        }[];
        total: number;
    }>;
    getPayouts(req: Request): Promise<{
        success: boolean;
        data: {
            doctors: {
                id: string;
                name: string;
                email: string;
                specialization: string | null;
                totalEarnings: number;
                appointmentCount: number;
                pendingPayout: number;
            }[];
        };
    }>;
    listPharmacies(req: Request): Promise<{
        success: boolean;
        data: {
            owner: {
                name: string;
                email: string;
            } | null;
            _count: {
                orders: number;
            };
            id: string;
            name: string;
            phone: string | null;
            isActive: boolean;
            createdAt: Date;
            city: string | null;
            address: string;
            latitude: number | null;
            longitude: number | null;
            ownerId: string | null;
            deliveryRadius: number | null;
            offersDelivery: boolean;
            offersPickup: boolean;
        }[];
    }>;
    togglePharmacy(id: string, req: Request): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            phone: string | null;
            isActive: boolean;
            createdAt: Date;
            city: string | null;
            address: string;
            latitude: number | null;
            longitude: number | null;
            ownerId: string | null;
            deliveryRadius: number | null;
            offersDelivery: boolean;
            offersPickup: boolean;
        };
    }>;
    listLabCenters(req: Request): Promise<{
        success: boolean;
        data: {
            owner: {
                name: string;
                email: string;
            } | null;
            _count: {
                tests: number;
                bookings: number;
            };
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
        }[];
    }>;
    toggleLab(id: string, req: Request): Promise<{
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
    getOnlineUsers(req: Request): Promise<{
        success: boolean;
        data: {
            onlineDoctors: ({
                user: {
                    name: string;
                    email: string;
                };
            } & {
                id: string;
                isVerified: boolean;
                createdAt: Date;
                userId: string;
                specialization: string | null;
                qualification: string | null;
                experience: number;
                rating: import("@prisma/client/runtime/library").Decimal;
                totalReviews: number;
                isOnline: boolean;
                verifiedAt: Date | null;
                about: string | null;
                consultationFee: import("@prisma/client/runtime/library").Decimal | null;
                city: string | null;
                location: string | null;
                languages: string[];
                consultationTypes: string[];
                imageUrl: string | null;
                homeVisits: boolean;
                homeVisitAreas: string[];
                certificationUrls: string[];
            })[];
            count: number;
        };
    }>;
    recentActivity(req: Request): Promise<{
        success: boolean;
        data: {
            recentUsers: {
                id: string;
                name: string;
                email: string;
                role: string;
                createdAt: Date;
            }[];
            recentAppointments: ({
                doctor: {
                    user: {
                        name: string;
                    };
                };
                patient: {
                    name: string;
                };
            } & {
                id: string;
                createdAt: Date;
                appointmentDate: Date | null;
                status: string;
                consultationType: string | null;
                reason: string | null;
                notes: string | null;
                paymentStatus: string;
                paymentAmount: import("@prisma/client/runtime/library").Decimal | null;
                confirmationCode: string | null;
                doctorId: string;
                slotId: string | null;
                patientId: string;
            })[];
            recentOrders: ({
                patient: {
                    name: string;
                };
            } & {
                id: string;
                createdAt: Date;
                status: string;
                notes: string | null;
                patientId: string;
                deliveryType: string;
                address: string | null;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                prescriptionStatus: string | null;
                prescriptionNote: string | null;
                prescriptionId: string | null;
                pharmacyId: string | null;
            })[];
        };
    }>;
}
