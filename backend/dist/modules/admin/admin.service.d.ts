import { PrismaService } from '../../lib/prisma.service';
export declare class AdminService {
    private prisma;
    constructor(prisma: PrismaService);
    private assertAdmin;
    stats(userId: string, dateFrom?: string, dateTo?: string): Promise<{
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
    revenue(userId: string): Promise<{
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
    listUsers(userId: string, page?: number, limit?: number, role?: string, q?: string): Promise<{
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
    toggleUserActive(adminId: string, targetId: string): Promise<{
        success: boolean;
        data: {
            id: string;
            isActive: boolean;
        };
    }>;
    listDoctors(userId: string): Promise<{
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
    verifyDoctor(adminId: string, doctorId: string): Promise<{
        success: boolean;
        data: {
            id: string;
            isVerified: boolean;
            userId: string;
            verifiedAt: Date | null;
        };
    }>;
    listPlans(userId: string): Promise<{
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
    createPlan(userId: string, data: {
        name: string;
        description?: string;
        price: number;
        durationDays: number;
        discountPct: number;
        features: string[];
        freeDelivery?: boolean;
        maxAnnualSavings?: number;
    }): Promise<{
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
    updatePlan(userId: string, planId: string, data: Partial<{
        name: string;
        description: string;
        price: number;
        durationDays: number;
        discountPct: number;
        features: string[];
        isActive: boolean;
        freeDelivery: boolean;
        maxAnnualSavings: number;
    }>): Promise<{
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
    deletePlan(userId: string, planId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    membershipStats(userId: string): Promise<{
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
    listCoupons(adminId: string): Promise<{
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
    createCoupon(adminId: string, data: {
        code: string;
        description?: string;
        discountType: string;
        discountValue: number;
        minAmount?: number;
        maxUses?: number;
        expiresAt?: string;
    }): Promise<{
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
    updateCoupon(adminId: string, couponId: string, data: {
        isActive?: boolean;
        maxUses?: number;
        expiresAt?: string;
    }): Promise<{
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
    deleteCoupon(adminId: string, couponId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    listAllAppointments(userId: string, status?: string, page?: number, limit?: number): Promise<{
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
    listAllOrders(userId: string, type?: 'pharmacy' | 'lab', page?: number, limit?: number): Promise<{
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
    getPayouts(userId: string): Promise<{
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
    getOnlineUsers(userId: string): Promise<{
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
    listPharmacies(userId: string): Promise<{
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
    togglePharmacyActive(adminId: string, pharmacyId: string): Promise<{
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
    listLabCenters(userId: string): Promise<{
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
    toggleLabActive(adminId: string, centerId: string): Promise<{
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
    recentActivity(userId: string): Promise<{
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
