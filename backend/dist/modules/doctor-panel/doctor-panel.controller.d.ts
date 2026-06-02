import { DoctorPanelService } from './doctor-panel.service';
export declare class DoctorPanelController {
    private service;
    constructor(service: DoctorPanelService);
    getProfile(req: any): Promise<{
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
    updateProfile(req: any, body: any): Promise<{
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
    setOnlineStatus(req: any, body: {
        isOnline: boolean;
    }): Promise<{
        isOnline: boolean;
    }>;
    updateHomeVisits(req: any, body: {
        homeVisits: boolean;
        homeVisitAreas?: string[];
    }): Promise<{
        homeVisits: boolean;
        homeVisitAreas: string[];
    }>;
    getAvailability(req: any): Promise<{
        id: string;
        isActive: boolean;
        doctorId: string;
        dayOfWeek: number;
        startTime: string;
        endTime: string;
        slotDurationMin: number;
    }[]>;
    updateAvailability(req: any, body: {
        slots: any[];
    }): Promise<{
        id: string;
        isActive: boolean;
        doctorId: string;
        dayOfWeek: number;
        startTime: string;
        endTime: string;
        slotDurationMin: number;
    }[]>;
    addCertification(req: any, body: {
        name: string;
        url: string;
    }): Promise<{
        certificationUrls: string[];
    }>;
    removeCertification(req: any, index: string): Promise<{
        certificationUrls: string[];
    }>;
    getStats(req: any): Promise<{
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
    getAppointments(req: any, status?: string, page?: string): Promise<{
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
    updateAppointmentStatus(id: string, body: {
        status: string;
        newDate?: string;
    }, req: any): Promise<{
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
    getPatientRecords(patientId: string, req: any): Promise<{
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
    issuePrescription(body: any, req: any): Promise<{
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
    getDoctorPrescriptions(req: any, page?: string): Promise<{
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
    getMessages(req: any): Promise<{
        success: boolean;
        data: any[];
    }>;
    sendMessage(body: {
        receiverId: string;
        message: string;
    }, req: any): Promise<{
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
