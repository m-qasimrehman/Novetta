"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelehealthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../lib/prisma.service");
let TelehealthService = class TelehealthService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSession(id, userId) {
        const session = await this.prisma.telehealthSession.findUnique({
            where: { id },
            include: {
                doctor: { include: { user: { select: { id: true, name: true } } } },
                patient: { select: { id: true, name: true, email: true } },
                appointment: true,
                consultationNotes: true,
                prescriptions: { include: { items: true } },
                labOrders: true,
            },
        });
        if (!session)
            throw new common_1.NotFoundException('Session not found');
        if (session.patientId !== userId && session.doctor.userId !== userId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return { success: true, data: session };
    }
    async startSession(appointmentId, userId) {
        const appointment = await this.prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: { doctor: true, telehealthSessions: true },
        });
        if (!appointment)
            throw new common_1.NotFoundException('Appointment not found');
        let session = appointment.telehealthSessions[0];
        if (!session) {
            const roomCode = Math.random().toString(36).substring(2, 10).toUpperCase();
            session = await this.prisma.telehealthSession.create({
                data: {
                    appointmentId,
                    doctorId: appointment.doctorId,
                    patientId: appointment.patientId,
                    roomCode,
                    meetingUrl: `https://meet.jit.si/novetta-${roomCode}`,
                    status: 'active',
                    startedAt: new Date(),
                },
            });
        }
        else if (session.status === 'scheduled') {
            session = await this.prisma.telehealthSession.update({
                where: { id: session.id },
                data: { status: 'active', startedAt: new Date() },
            });
        }
        return { success: true, data: session };
    }
    async endSession(id, userId) {
        const session = await this.prisma.telehealthSession.findUnique({ where: { id }, include: { doctor: true } });
        if (!session)
            throw new common_1.NotFoundException('Session not found');
        if (session.doctor.userId !== userId && session.patientId !== userId)
            throw new common_1.ForbiddenException('Access denied');
        const updated = await this.prisma.telehealthSession.update({
            where: { id },
            data: { status: 'completed', endedAt: new Date() },
        });
        return { success: true, message: 'Session ended', data: updated };
    }
    async addConsultationNote(sessionId, doctorUserId, data) {
        const session = await this.prisma.telehealthSession.findUnique({ where: { id: sessionId }, include: { doctor: true } });
        if (!session)
            throw new common_1.NotFoundException('Session not found');
        if (session.doctor.userId !== doctorUserId)
            throw new common_1.ForbiddenException('Only the doctor can add notes');
        const note = await this.prisma.consultationNote.create({
            data: {
                sessionId,
                doctorId: session.doctorId,
                patientId: session.patientId,
                ...data,
            },
        });
        return { success: true, data: note };
    }
    async addPrescription(sessionId, doctorUserId, data) {
        const session = await this.prisma.telehealthSession.findUnique({ where: { id: sessionId }, include: { doctor: true } });
        if (!session)
            throw new common_1.NotFoundException('Session not found');
        if (session.doctor.userId !== doctorUserId)
            throw new common_1.ForbiddenException('Only the doctor can prescribe');
        const prescription = await this.prisma.prescription.create({
            data: {
                sessionId,
                doctorId: session.doctorId,
                patientId: session.patientId,
                notes: data.notes,
                items: { create: data.items },
            },
            include: { items: true },
        });
        return { success: true, data: prescription };
    }
    async addLabOrder(sessionId, doctorUserId, data) {
        const session = await this.prisma.telehealthSession.findUnique({ where: { id: sessionId }, include: { doctor: true } });
        if (!session)
            throw new common_1.NotFoundException('Session not found');
        if (session.doctor.userId !== doctorUserId)
            throw new common_1.ForbiddenException('Only the doctor can order tests');
        const order = await this.prisma.labOrder.create({
            data: {
                sessionId,
                doctorId: session.doctorId,
                patientId: session.patientId,
                ...data,
            },
        });
        return { success: true, data: order };
    }
    async listForPatient(patientId) {
        const sessions = await this.prisma.telehealthSession.findMany({
            where: { patientId },
            orderBy: { createdAt: 'desc' },
            include: {
                doctor: { include: { user: { select: { id: true, name: true } } } },
                appointment: { select: { id: true, consultationType: true, appointmentDate: true } },
                prescriptions: { include: { items: true } },
            },
        });
        return { success: true, data: sessions };
    }
};
exports.TelehealthService = TelehealthService;
exports.TelehealthService = TelehealthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TelehealthService);
