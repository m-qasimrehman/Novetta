import { AppointmentsService } from './appointments.service';
export declare class AppointmentsController {
    private appointmentsService;
    constructor(appointmentsService: AppointmentsService);
    book(body: {
        doctorId: string;
        slotId?: string;
        appointmentDate: string;
        consultationType: string;
        reason?: string;
        notes?: string;
    }, req: any): Promise<{
        success: boolean;
        message: string;
        data: {
            doctor: {
                user: {
                    id: string;
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
            patient: {
                id: string;
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
        };
    }>;
    list(req: any, status?: string): Promise<{
        success: boolean;
        data: ({
            doctor: {
                user: {
                    id: string;
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
            telehealthSessions: {
                id: string;
                status: string;
                meetingUrl: string | null;
                roomCode: string | null;
            }[];
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
    }>;
    findOne(id: string, req: any): Promise<{
        success: boolean;
        data: {
            doctor: {
                user: {
                    id: string;
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
            };
            telehealthSessions: {
                id: string;
                createdAt: Date;
                status: string;
                doctorId: string;
                patientId: string;
                meetingUrl: string | null;
                roomCode: string | null;
                startedAt: Date | null;
                endedAt: Date | null;
                appointmentId: string | null;
            }[];
            slot: {
                id: string;
                isActive: boolean;
                doctorId: string;
                dayOfWeek: number;
                startTime: string;
                endTime: string;
                slotDurationMin: number;
            } | null;
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
        };
    }>;
    cancel(id: string, req: any): Promise<{
        success: boolean;
        message: string;
        data: {
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
    confirmPayment(id: string, req: any): Promise<{
        success: boolean;
        data: {
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
    reschedule(id: string, body: {
        appointmentDate: string;
    }, req: any): Promise<{
        success: boolean;
        message: string;
        data: {
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
}
