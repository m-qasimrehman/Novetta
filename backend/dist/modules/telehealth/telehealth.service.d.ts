import { PrismaService } from '../../lib/prisma.service';
export declare class TelehealthService {
    private prisma;
    constructor(prisma: PrismaService);
    getSession(id: string, userId: string): Promise<{
        success: boolean;
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
            appointment: {
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
            } | null;
            prescriptions: ({
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
            consultationNotes: {
                id: string;
                createdAt: Date;
                notes: string | null;
                doctorId: string;
                patientId: string;
                sessionId: string;
                diagnosis: string | null;
            }[];
            labOrders: {
                id: string;
                createdAt: Date;
                status: string;
                doctorId: string;
                patientId: string;
                sessionId: string;
                testName: string | null;
                instructions: string | null;
            }[];
            patient: {
                id: string;
                name: string;
                email: string;
            };
        } & {
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
        };
    }>;
    startSession(appointmentId: string, userId: string): Promise<{
        success: boolean;
        data: {
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
        };
    }>;
    endSession(id: string, userId: string): Promise<{
        success: boolean;
        message: string;
        data: {
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
        };
    }>;
    addConsultationNote(sessionId: string, doctorUserId: string, data: {
        diagnosis?: string;
        notes?: string;
    }): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            notes: string | null;
            doctorId: string;
            patientId: string;
            sessionId: string;
            diagnosis: string | null;
        };
    }>;
    addPrescription(sessionId: string, doctorUserId: string, data: {
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
    addLabOrder(sessionId: string, doctorUserId: string, data: {
        testName: string;
        instructions?: string;
    }): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            status: string;
            doctorId: string;
            patientId: string;
            sessionId: string;
            testName: string | null;
            instructions: string | null;
        };
    }>;
    listForPatient(patientId: string): Promise<{
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
            appointment: {
                id: string;
                appointmentDate: Date | null;
                consultationType: string | null;
            } | null;
            prescriptions: ({
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
        } & {
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
        })[];
    }>;
}
