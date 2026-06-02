import { PrismaService } from '../../lib/prisma.service';
export declare class DoctorsService {
    private prisma;
    constructor(prisma: PrismaService);
    search(filters: {
        q?: string;
        specialization?: string;
        city?: string;
        consultationType?: string;
        minRating?: number;
        minExperience?: number;
        maxFee?: number;
        page?: number;
        limit?: number;
    }): Promise<{
        doctors: ({
            user: {
                id: string;
                name: string;
                email: string;
            };
            _count: {
                appointments: number;
                reviews: number;
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
        pagination: {
            total: number;
            page: number;
            limit: number;
            pages: number;
        };
    }>;
    findById(id: string): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
        };
        reviews: ({
            patient: {
                id: string;
                name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            rating: number;
            doctorId: string;
            patientId: string;
            appointmentId: string | null;
            comment: string | null;
        })[];
        availabilitySlots: {
            id: string;
            isActive: boolean;
            doctorId: string;
            dayOfWeek: number;
            startTime: string;
            endTime: string;
            slotDurationMin: number;
        }[];
        _count: {
            appointments: number;
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
    }>;
    getAvailableSlots(doctorId: string, date: string): Promise<{
        date: string;
        slots: {
            slotId: string;
            time: string;
            available: boolean;
        }[];
    }>;
    addReview(doctorId: string, patientId: string, data: {
        rating: number;
        comment?: string;
        appointmentId?: string;
    }): Promise<{
        patient: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        rating: number;
        doctorId: string;
        patientId: string;
        appointmentId: string | null;
        comment: string | null;
    }>;
    getSpecializations(): Promise<(string | null)[]>;
    getCities(): Promise<(string | null)[]>;
}
