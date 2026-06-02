export declare class RegisterDto {
    name: string;
    email: string;
    phone?: string;
    password: string;
    role?: 'patient' | 'doctor';
    specialization?: string;
    qualification?: string;
    experience?: number;
    city?: string;
}
