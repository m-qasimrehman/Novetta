import { PrismaService } from '../../lib/prisma.service';
export declare class PharmacyService {
    private prisma;
    constructor(prisma: PrismaService);
    searchMedicines(filters: {
        q?: string;
        category?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            createdAt: Date;
            imageUrl: string | null;
            description: string | null;
            category: string | null;
            manufacturer: string | null;
            genericName: string | null;
            price: import("@prisma/client/runtime/library").Decimal;
            unit: string | null;
            barcode: string | null;
            inStock: boolean;
            prescriptionRequired: boolean;
            stockQuantity: number;
            lowThreshold: number;
        }[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            pages: number;
        };
    }>;
    findMedicineById(id: string): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            createdAt: Date;
            imageUrl: string | null;
            description: string | null;
            category: string | null;
            manufacturer: string | null;
            genericName: string | null;
            price: import("@prisma/client/runtime/library").Decimal;
            unit: string | null;
            barcode: string | null;
            inStock: boolean;
            prescriptionRequired: boolean;
            stockQuantity: number;
            lowThreshold: number;
        };
    }>;
    getCategories(): Promise<(string | null)[]>;
    scanPrescription(_fileName?: string): Promise<{
        success: boolean;
        medicines: any[];
        message: string;
    }>;
    lookupBarcode(barcode: string): Promise<{
        success: boolean;
        data: {
            medicine: {
                id: string;
                name: string;
                createdAt: Date;
                imageUrl: string | null;
                description: string | null;
                category: string | null;
                manufacturer: string | null;
                genericName: string | null;
                price: import("@prisma/client/runtime/library").Decimal;
                unit: string | null;
                barcode: string | null;
                inStock: boolean;
                prescriptionRequired: boolean;
                stockQuantity: number;
                lowThreshold: number;
            };
            comparison: {
                price: number;
                inStock: boolean;
                memberDiscount: number;
                memberPrice: number;
                id: string;
                name: string;
                distance: string;
                rating: number;
                deliveryTime: string;
            }[];
        };
    }>;
    comparePrices(medicineId: string): Promise<{
        success: boolean;
        data: {
            medicine: {
                id: string;
                name: string;
                createdAt: Date;
                imageUrl: string | null;
                description: string | null;
                category: string | null;
                manufacturer: string | null;
                genericName: string | null;
                price: import("@prisma/client/runtime/library").Decimal;
                unit: string | null;
                barcode: string | null;
                inStock: boolean;
                prescriptionRequired: boolean;
                stockQuantity: number;
                lowThreshold: number;
            };
            pharmacies: {
                price: number;
                inStock: boolean;
                memberDiscount: number;
                memberPrice: number;
                id: string;
                name: string;
                distance: string;
                rating: number;
                deliveryTime: string;
            }[];
        };
    }>;
    private buildComparison;
    getOrderTracking(orderId: string, patientId: string): Promise<{
        success: boolean;
        data: {
            order: {
                id: string;
                status: string;
                deliveryType: string;
                address: string | null;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                createdAt: Date;
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
            };
            tracking: {
                steps: {
                    id: string;
                    label: string;
                    icon: string;
                    completedAt: string | null;
                    done: boolean;
                }[];
                currentStep: number;
                estimatedDelivery: string;
                rider: {
                    name: string;
                    phone: string;
                    rating: number;
                } | null;
            };
        };
    }>;
    pharmacistConsult(symptoms: string[]): Promise<{
        success: boolean;
        data: {
            symptoms: string[];
            advice: string;
            disclaimer: string;
            recommendations: {
                id: string;
                name: string;
                createdAt: Date;
                imageUrl: string | null;
                description: string | null;
                category: string | null;
                manufacturer: string | null;
                genericName: string | null;
                price: import("@prisma/client/runtime/library").Decimal;
                unit: string | null;
                barcode: string | null;
                inStock: boolean;
                prescriptionRequired: boolean;
                stockQuantity: number;
                lowThreshold: number;
            }[];
        };
    }>;
    createOrder(patientId: string, data: {
        items: {
            medicineId: string;
            quantity: number;
        }[];
        deliveryType: string;
        address?: string;
        prescriptionId?: string;
        notes?: string;
        couponCode?: string;
    }): Promise<{
        success: boolean;
        message: string;
        data: {
            items: ({
                medicine: {
                    id: string;
                    name: string;
                    createdAt: Date;
                    imageUrl: string | null;
                    description: string | null;
                    category: string | null;
                    manufacturer: string | null;
                    genericName: string | null;
                    price: import("@prisma/client/runtime/library").Decimal;
                    unit: string | null;
                    barcode: string | null;
                    inStock: boolean;
                    prescriptionRequired: boolean;
                    stockQuantity: number;
                    lowThreshold: number;
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
        };
    }>;
    listOrders(patientId: string): Promise<{
        success: boolean;
        data: ({
            prescription: {
                id: string;
                createdAt: Date;
            } | null;
            items: ({
                medicine: {
                    id: string;
                    name: string;
                    imageUrl: string | null;
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
    }>;
    getOrder(id: string, patientId: string): Promise<{
        success: boolean;
        data: {
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
            items: ({
                medicine: {
                    id: string;
                    name: string;
                    createdAt: Date;
                    imageUrl: string | null;
                    description: string | null;
                    category: string | null;
                    manufacturer: string | null;
                    genericName: string | null;
                    price: import("@prisma/client/runtime/library").Decimal;
                    unit: string | null;
                    barcode: string | null;
                    inStock: boolean;
                    prescriptionRequired: boolean;
                    stockQuantity: number;
                    lowThreshold: number;
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
        };
    }>;
    private deliveryOtps;
    generateDeliveryOtp(orderId: string, patientId: string): Promise<{
        success: boolean;
        data: {
            otp: string;
        };
    }>;
    confirmDeliveryOtp(orderId: string, patientId: string, otp: string): Promise<{
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
    cancelOrder(id: string, patientId: string): Promise<{
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
    listPharmacies(city?: string): Promise<{
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
        }[];
    }>;
    getPharmacyInventory(pharmacyId: string, q?: string): Promise<{
        success: boolean;
        data: {
            stockStatus: string;
            medicine: {
                id: string;
                name: string;
                imageUrl: string | null;
                description: string | null;
                category: string | null;
                genericName: string | null;
                prescriptionRequired: boolean;
            };
            id: string;
            pharmacyId: string;
            price: import("@prisma/client/runtime/library").Decimal;
            lowThreshold: number;
            medicineId: string;
            stock: number;
            isAvailable: boolean;
            updatedAt: Date;
        }[];
    }>;
    createConsultSession(patientId: string, symptoms: string[], pharmacyId?: string): Promise<{
        success: boolean;
        data: {
            patient: {
                id: string;
                name: string;
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
    getMyConsultSessions(patientId: string): Promise<{
        success: boolean;
        data: ({
            pharmacist: {
                id: string;
                name: string;
            } | null;
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
    getPatientChatMessages(patientId: string, pharmacistId: string): Promise<{
        success: boolean;
        data: ({
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
        })[];
    }>;
    sendPatientMessage(patientId: string, receiverId: string, message: string): Promise<{
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
    cancelConsultSession(patientId: string, sessionId: string): Promise<{
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
}
