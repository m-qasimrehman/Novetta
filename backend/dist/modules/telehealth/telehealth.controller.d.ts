import { TelehealthService } from './telehealth.service';
export declare class TelehealthController {
    private telehealthService;
    constructor(telehealthService: TelehealthService);
    listMySessions(req: any): Promise<{
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
    getSession(id: string, req: any): Promise<{
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
    startSession(appointmentId: string, req: any): Promise<{
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
    endSession(id: string, req: any): Promise<{
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
    addNote(id: string, body: {
        diagnosis?: string;
        notes?: string;
    }, req: any): Promise<{
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
    addPrescription(id: string, body: {
        notes?: string;
        items: {
            medicineName: string;
            dosage?: string;
            frequency?: string;
            duration?: string;
            instructions?: string;
        }[];
    }, req: any): Promise<{
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
    addLabOrder(id: string, body: {
        testName: string;
        instructions?: string;
    }, req: any): Promise<{
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
}
