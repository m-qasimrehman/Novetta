import { PrismaService } from '../../lib/prisma.service';
export declare class PharmacistPanelService {
    private prisma;
    constructor(prisma: PrismaService);
    private assertPharmacist;
    getQueue(pharmacistId: string): Promise<{
        success: boolean;
        data: ({
            patient: {
                id: string;
                name: string;
                email: string;
                phone: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            status: string;
            patientId: string;
            pharmacyId: string | null;
            symptoms: string[];
            sessionNotes: string | null;
            signatureHash: string | null;
            signedAt: Date | null;
            completedAt: Date | null;
            pharmacistId: string | null;
        })[];
    }>;
    acceptSession(pharmacistId: string, sessionId: string): Promise<{
        success: boolean;
        data: {
            patient: {
                id: string;
                name: string;
                email: string;
                phone: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            status: string;
            patientId: string;
            pharmacyId: string | null;
            symptoms: string[];
            sessionNotes: string | null;
            signatureHash: string | null;
            signedAt: Date | null;
            completedAt: Date | null;
            pharmacistId: string | null;
        };
    }>;
    completeSession(pharmacistId: string, sessionId: string, notes?: string): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            status: string;
            patientId: string;
            pharmacyId: string | null;
            symptoms: string[];
            sessionNotes: string | null;
            signatureHash: string | null;
            signedAt: Date | null;
            completedAt: Date | null;
            pharmacistId: string | null;
        };
    }>;
    getMyActiveSessions(pharmacistId: string): Promise<{
        success: boolean;
        data: ({
            patient: {
                id: string;
                name: string;
                email: string;
                phone: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            status: string;
            patientId: string;
            pharmacyId: string | null;
            symptoms: string[];
            sessionNotes: string | null;
            signatureHash: string | null;
            signedAt: Date | null;
            completedAt: Date | null;
            pharmacistId: string | null;
        })[];
    }>;
    issuePrescriptionWithSignature(pharmacistId: string, sessionId: string, data: {
        patientId: string;
        notes?: string;
        sessionNotes?: string;
        items: {
            medicineName: string;
            dosage?: string;
            frequency?: string;
            duration?: string;
            instructions?: string;
        }[];
    }): Promise<{
        success: boolean;
        data: {
            prescription: {
                patient: {
                    name: string;
                    email: string;
                };
                items: {
                    id: string;
                    instructions: string | null;
                    prescriptionId: string;
                    medicineName: string | null;
                    dosage: string | null;
                    frequency: string | null;
                    duration: string | null;
                }[];
            } & {
                id: string;
                createdAt: Date;
                notes: string | null;
                doctorId: string;
                patientId: string;
                sessionId: string;
            };
            signature: {
                hash: string;
                timestamp: string;
                pharmacistName: string;
                pharmacistId: string;
                sessionId: string;
                prescriptionId: string;
                algorithm: string;
                status: string;
            };
        };
    }>;
    getInventory(pharmacistId: string, pharmacyId: string): Promise<{
        success: boolean;
        data: ({
            medicine: {
                id: string;
                name: string;
                category: string | null;
                genericName: string | null;
                prescriptionRequired: boolean;
            };
        } & {
            id: string;
            pharmacyId: string;
            price: import("@prisma/client/runtime/library").Decimal;
            lowThreshold: number;
            medicineId: string;
            stock: number;
            isAvailable: boolean;
            updatedAt: Date;
        })[];
    }>;
    upsertInventory(pharmacistId: string, pharmacyId: string, medicineId: string, stock: number, price: number, lowThreshold?: number): Promise<{
        success: boolean;
        data: {
            medicine: {
                id: string;
                name: string;
            };
        } & {
            id: string;
            pharmacyId: string;
            price: import("@prisma/client/runtime/library").Decimal;
            lowThreshold: number;
            medicineId: string;
            stock: number;
            isAvailable: boolean;
            updatedAt: Date;
        };
    }>;
    getMyPharmacy(pharmacistId: string): Promise<{
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
        } | null;
        pharmacist: {
            id: string | undefined;
            name: string | undefined;
            email: string | undefined;
        };
    }>;
    getOrders(pharmacistId: string, pharmacyId?: string, status?: string, page?: number, limit?: number): Promise<{
        success: boolean;
        data: ({
            prescription: ({
                items: {
                    id: string;
                    instructions: string | null;
                    prescriptionId: string;
                    medicineName: string | null;
                    dosage: string | null;
                    frequency: string | null;
                    duration: string | null;
                }[];
            } & {
                id: string;
                createdAt: Date;
                notes: string | null;
                doctorId: string;
                patientId: string;
                sessionId: string;
            }) | null;
            patient: {
                id: string;
                name: string;
                email: string;
                phone: string | null;
            };
            items: ({
                medicine: {
                    id: string;
                    name: string;
                };
            } & {
                id: string;
                price: import("@prisma/client/runtime/library").Decimal;
                orderId: string;
                medicineId: string;
                quantity: number;
            })[];
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
        total: number;
        page: number;
        pages: number;
    }>;
    updateOrderStatus(pharmacistId: string, orderId: string, status: string): Promise<{
        success: boolean;
        data: {
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
        };
    }>;
    validatePrescription(pharmacistId: string, orderId: string, approved: boolean, note?: string): Promise<{
        success: boolean;
        data: {
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
        };
    }>;
    getSessionMessages(pharmacistId: string, patientId: string): Promise<{
        success: boolean;
        data: {
            isMine: boolean;
            sender: {
                id: string;
                name: string;
                role: string;
            };
            message: string | null;
            id: string;
            createdAt: Date;
            receiverId: string;
            senderId: string;
        }[];
    }>;
    sendMessage(pharmacistId: string, receiverId: string, message: string): Promise<{
        success: boolean;
        data: {
            sender: {
                id: string;
                name: string;
            };
        } & {
            message: string | null;
            id: string;
            createdAt: Date;
            receiverId: string;
            senderId: string;
        };
    }>;
    getPatientSummary(pharmacistId: string, patientId: string): Promise<{
        success: boolean;
        data: {
            patient: {
                id: string;
                name: string;
                email: string;
                phone: string | null;
            } | null;
            medicalHistory: {
                id: string;
                createdAt: Date;
                notes: string | null;
                patientId: string;
                condition: string;
                diagnosedAt: Date | null;
                isCurrent: boolean;
            }[];
            recentPrescriptions: ({
                doctor: {
                    user: {
                        name: string;
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
                };
                items: {
                    id: string;
                    instructions: string | null;
                    prescriptionId: string;
                    medicineName: string | null;
                    dosage: string | null;
                    frequency: string | null;
                    duration: string | null;
                }[];
            } & {
                id: string;
                createdAt: Date;
                notes: string | null;
                doctorId: string;
                patientId: string;
                sessionId: string;
            })[];
        };
    }>;
}
