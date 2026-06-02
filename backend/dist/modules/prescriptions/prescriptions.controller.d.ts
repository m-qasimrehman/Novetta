import { PrescriptionsService } from './prescriptions.service';
export declare class PrescriptionsController {
    private prescriptionsService;
    constructor(prescriptionsService: PrescriptionsService);
    list(req: any): Promise<{
        success: boolean;
        data: ({
            session: {
                id: string;
                createdAt: Date;
                appointmentId: string | null;
            };
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
    }>;
    findOne(id: string, req: any): Promise<{
        success: boolean;
        data: {
            session: {
                appointment: {
                    id: string;
                    appointmentDate: Date | null;
                    consultationType: string | null;
                    confirmationCode: string | null;
                } | null;
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
                phone: string | null;
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
}
