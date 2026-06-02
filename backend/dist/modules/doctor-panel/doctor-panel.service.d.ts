import { PrismaService } from '../../lib/prisma.service';
export declare class DoctorPanelService {
    private prisma;
    constructor(prisma: PrismaService);
    private getDoctorOrThrow;
    getProfile(userId: string): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            phone: string | null;
        };
        doctor: {
            availabilitySlots: {
                id: string;
                isActive: boolean;
                doctorId: string;
                dayOfWeek: number;
                startTime: string;
                endTime: string;
                slotDurationMin: number;
            }[];
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
    }>;
    updateProfile(userId: string, data: {
        name?: string;
        specialization?: string;
        qualification?: string;
        experience?: number;
        about?: string;
        consultationFee?: number;
        city?: string;
        location?: string;
        languages?: string[];
        consultationTypes?: string[];
        imageUrl?: string;
    }): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            phone: string | null;
        };
        doctor: ({
            availabilitySlots: {
                id: string;
                isActive: boolean;
                doctorId: string;
                dayOfWeek: number;
                startTime: string;
                endTime: string;
                slotDurationMin: number;
            }[];
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
        }) | null;
    }>;
    setOnlineStatus(userId: string, isOnline: boolean): Promise<{
        isOnline: boolean;
    }>;
    updateHomeVisits(userId: string, homeVisits: boolean, homeVisitAreas?: string[]): Promise<{
        homeVisits: boolean;
        homeVisitAreas: string[];
    }>;
    getAvailability(userId: string): Promise<{
        id: string;
        isActive: boolean;
        doctorId: string;
        dayOfWeek: number;
        startTime: string;
        endTime: string;
        slotDurationMin: number;
    }[]>;
    updateAvailability(userId: string, slots: {
        dayOfWeek: number;
        startTime: string;
        endTime: string;
        slotDurationMin?: number;
        isActive?: boolean;
    }[]): Promise<{
        id: string;
        isActive: boolean;
        doctorId: string;
        dayOfWeek: number;
        startTime: string;
        endTime: string;
        slotDurationMin: number;
    }[]>;
    addCertification(userId: string, name: string, url: string): Promise<{
        certificationUrls: string[];
    }>;
    removeCertification(userId: string, index: number): Promise<{
        certificationUrls: string[];
    }>;
    getStats(userId: string): Promise<{
        total: number;
        pending: number;
        confirmed: number;
        completed: number;
        cancelled: number;
        todayCount: number;
        weekCount: number;
        revenue: number;
        rating: number;
        totalReviews: number;
        isOnline: boolean;
        upcoming: ({
            patient: {
                id: string;
                name: string;
                email: string;
                phone: string | null;
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
        recentPayments: {
            id: string;
            appointmentDate: Date | null;
            consultationType: string | null;
            paymentAmount: import("@prisma/client/runtime/library").Decimal | null;
            patient: {
                name: string;
            };
        }[];
    }>;
    getAppointments(userId: string, status?: string, page?: number, limit?: number): Promise<{
        success: boolean;
        data: ({
            telehealthSessions: {
                id: string;
                status: string;
                meetingUrl: string | null;
            }[];
            patient: {
                id: string;
                name: string;
                email: string;
                phone: string | null;
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
    updateAppointmentStatus(userId: string, appointmentId: string, status: string, newDate?: string): Promise<{
        success: boolean;
        data: {
            patient: {
                id: string;
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
        };
    }>;
    getPatientRecords(userId: string, patientId: string): Promise<{
        success: boolean;
        data: {
            patient: {
                id: string;
                name: string;
                email: string;
                phone: string | null;
                createdAt: Date;
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
            medicalRecords: {
                id: string;
                createdAt: Date;
                patientId: string;
                title: string | null;
                description: string | null;
                fileUrl: string | null;
                recordType: string | null;
            }[];
            previousNotes: {
                id: string;
                createdAt: Date;
                notes: string | null;
                doctorId: string;
                patientId: string;
                sessionId: string;
                diagnosis: string | null;
            }[];
            previousPrescriptions: ({
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
    issuePrescription(userId: string, data: {
        patientId: string;
        appointmentId?: string;
        notes?: string;
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
    }>;
    getDoctorPrescriptions(userId: string, page?: number, limit?: number): Promise<{
        success: boolean;
        data: ({
            patient: {
                id: string;
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
        })[];
        total: number;
        page: number;
        pages: number;
    }>;
    getMessages(userId: string): Promise<{
        success: boolean;
        data: any[];
    }>;
    sendMessage(userId: string, receiverId: string, message: string): Promise<{
        success: boolean;
        data: {
            receiver: {
                id: string;
                name: string;
            };
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
}
