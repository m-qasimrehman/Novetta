import { PharmacistPanelService } from './pharmacist-panel.service';
export declare class PharmacistPanelController {
    private svc;
    constructor(svc: PharmacistPanelService);
    getMe(req: any): Promise<{
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
    getQueue(req: any): Promise<{
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
    getActiveSessions(req: any): Promise<{
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
    acceptSession(id: string, req: any): Promise<{
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
    completeSession(id: string, body: {
        notes?: string;
    }, req: any): Promise<{
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
    issuePrescription(sessionId: string, body: any, req: any): Promise<{
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
    getMessages(patientId: string, req: any): Promise<{
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
    sendMessage(body: {
        receiverId: string;
        message: string;
    }, req: any): Promise<{
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
    getPatientSummary(patientId: string, req: any): Promise<{
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
    getInventory(pharmacyId: string, req: any): Promise<{
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
    upsertInventory(pharmacyId: string, body: {
        medicineId: string;
        stock: number;
        price: number;
        lowThreshold?: number;
    }, req: any): Promise<{
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
    getOrders(req: any, pharmacyId?: string, status?: string, page?: string): Promise<{
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
    updateOrderStatus(id: string, body: {
        status: string;
    }, req: any): Promise<{
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
    validatePrescription(id: string, body: {
        approved: boolean;
        note?: string;
    }, req: any): Promise<{
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
}
