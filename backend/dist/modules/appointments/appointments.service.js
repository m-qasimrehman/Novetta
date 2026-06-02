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
exports.AppointmentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../lib/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
function generateConfirmationCode() {
    return 'NC' + Math.random().toString(36).substring(2, 8).toUpperCase();
}
let AppointmentsService = class AppointmentsService {
    prisma;
    notificationsService;
    constructor(prisma, notificationsService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
    }
    async book(patientId, dto) {
        const doctor = await this.prisma.doctor.findUnique({ where: { id: dto.doctorId } });
        if (!doctor)
            throw new common_1.NotFoundException('Doctor not found');
        const appointmentDate = new Date(dto.appointmentDate);
        // check for conflict
        const conflict = await this.prisma.appointment.findFirst({
            where: {
                doctorId: dto.doctorId,
                appointmentDate,
                status: { in: ['pending', 'confirmed'] },
            },
        });
        if (conflict)
            throw new common_1.BadRequestException('This slot is already booked');
        const appointment = await this.prisma.appointment.create({
            data: {
                patientId,
                doctorId: dto.doctorId,
                slotId: dto.slotId,
                appointmentDate,
                consultationType: dto.consultationType,
                reason: dto.reason,
                notes: dto.notes,
                status: 'pending',
                paymentStatus: 'pending',
                paymentAmount: doctor.consultationFee,
                confirmationCode: generateConfirmationCode(),
            },
            include: {
                doctor: {
                    include: { user: { select: { id: true, name: true } } },
                },
                patient: { select: { id: true, name: true, email: true } },
            },
        });
        // auto-create telehealth session for telehealth appointments
        if (dto.consultationType === 'telehealth') {
            const roomCode = Math.random().toString(36).substring(2, 10).toUpperCase();
            await this.prisma.telehealthSession.create({
                data: {
                    appointmentId: appointment.id,
                    doctorId: dto.doctorId,
                    patientId,
                    roomCode,
                    meetingUrl: `https://meet.jit.si/novetta-${roomCode}`,
                    status: 'scheduled',
                },
            });
        }
        // Send notifications to both patient and doctor
        const dateStr = appointmentDate.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
        const timeStr = appointmentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        await Promise.allSettled([
            this.notificationsService.create(patientId, {
                title: 'Appointment Request Sent',
                body: `Your ${dto.consultationType} appointment request with ${appointment.doctor.user.name} on ${dateStr} at ${timeStr} is awaiting doctor confirmation (${appointment.confirmationCode}).`,
                type: 'appointment',
            }),
            this.notificationsService.create(appointment.doctor.userId, {
                title: 'New Appointment Request',
                body: `${appointment.patient?.name} has requested a ${dto.consultationType} appointment on ${dateStr} at ${timeStr}. Please confirm or decline.`,
                type: 'appointment',
            }),
        ]);
        return { success: true, message: 'Appointment booked', data: appointment };
    }
    async confirmPayment(appointmentId, patientId) {
        const appointment = await this.prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: { doctor: { include: { user: { select: { id: true, name: true } } } } },
        });
        if (!appointment)
            throw new common_1.NotFoundException('Appointment not found');
        if (appointment.patientId !== patientId)
            throw new common_1.ForbiddenException();
        const updated = await this.prisma.appointment.update({
            where: { id: appointmentId },
            data: { paymentStatus: 'paid', status: 'confirmed' },
        });
        await this.notificationsService.create(patientId, {
            title: 'Payment Confirmed',
            body: `Payment received for your appointment with ${appointment.doctor.user.name}. See you soon!`,
            type: 'payment',
        }).catch(() => { });
        return { success: true, data: updated };
    }
    async listForPatient(patientId, status) {
        const appointments = await this.prisma.appointment.findMany({
            where: {
                patientId,
                ...(status ? { status } : {}),
            },
            orderBy: { appointmentDate: 'desc' },
            include: {
                doctor: {
                    include: { user: { select: { id: true, name: true } } },
                },
                telehealthSessions: { select: { id: true, roomCode: true, meetingUrl: true, status: true } },
            },
        });
        return { success: true, data: appointments };
    }
    async findOne(id, userId) {
        const appointment = await this.prisma.appointment.findUnique({
            where: { id },
            include: {
                doctor: {
                    include: { user: { select: { id: true, name: true, email: true } } },
                },
                patient: { select: { id: true, name: true, email: true, phone: true } },
                telehealthSessions: true,
                slot: true,
            },
        });
        if (!appointment)
            throw new common_1.NotFoundException('Appointment not found');
        if (appointment.patientId !== userId)
            throw new common_1.ForbiddenException('Access denied');
        return { success: true, data: appointment };
    }
    async cancel(id, userId) {
        const appointment = await this.prisma.appointment.findUnique({ where: { id } });
        if (!appointment)
            throw new common_1.NotFoundException('Appointment not found');
        if (appointment.patientId !== userId)
            throw new common_1.ForbiddenException('Access denied');
        if (appointment.status === 'cancelled')
            throw new common_1.BadRequestException('Already cancelled');
        const updated = await this.prisma.appointment.update({
            where: { id },
            data: { status: 'cancelled' },
        });
        return { success: true, message: 'Appointment cancelled', data: updated };
    }
    async reschedule(id, userId, newDate) {
        const appointment = await this.prisma.appointment.findUnique({ where: { id } });
        if (!appointment)
            throw new common_1.NotFoundException('Appointment not found');
        if (appointment.patientId !== userId)
            throw new common_1.ForbiddenException('Access denied');
        if (appointment.status === 'cancelled')
            throw new common_1.BadRequestException('Cannot reschedule a cancelled appointment');
        const updated = await this.prisma.appointment.update({
            where: { id },
            data: { appointmentDate: new Date(newDate), status: 'confirmed' },
        });
        return { success: true, message: 'Appointment rescheduled', data: updated };
    }
};
exports.AppointmentsService = AppointmentsService;
exports.AppointmentsService = AppointmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], AppointmentsService);
