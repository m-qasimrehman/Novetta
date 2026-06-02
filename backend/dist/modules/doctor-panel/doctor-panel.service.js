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
exports.DoctorPanelService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../lib/prisma.service");
let DoctorPanelService = class DoctorPanelService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDoctorOrThrow(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.role !== 'doctor')
            throw new common_1.ForbiddenException('Doctor access required');
        const doctor = await this.prisma.doctor.findUnique({ where: { userId } });
        if (!doctor) {
            return this.prisma.doctor.create({ data: { userId } });
        }
        return doctor;
    }
    async getProfile(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.role !== 'doctor')
            throw new common_1.ForbiddenException('Doctor access required');
        const doctor = await this.prisma.doctor.upsert({
            where: { userId },
            create: { userId },
            update: {},
            include: { availabilitySlots: { orderBy: { dayOfWeek: 'asc' } } },
        });
        return { user: { id: user.id, name: user.name, email: user.email, phone: user.phone }, doctor };
    }
    async updateProfile(userId, data) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.role !== 'doctor')
            throw new common_1.ForbiddenException('Doctor access required');
        const { name, ...doctorData } = data;
        const [updatedUser] = await Promise.all([
            name ? this.prisma.user.update({ where: { id: userId }, data: { name } }) : Promise.resolve(user),
            this.prisma.doctor.upsert({
                where: { userId },
                create: { userId, ...doctorData },
                update: doctorData,
            }),
        ]);
        const doctor = await this.prisma.doctor.findUnique({ where: { userId }, include: { availabilitySlots: true } });
        return { user: { id: updatedUser.id, name: updatedUser.name, email: updatedUser.email, phone: updatedUser.phone }, doctor };
    }
    async setOnlineStatus(userId, isOnline) {
        const doctor = await this.getDoctorOrThrow(userId);
        const updated = await this.prisma.doctor.update({ where: { id: doctor.id }, data: { isOnline } });
        return { isOnline: updated.isOnline };
    }
    async updateHomeVisits(userId, homeVisits, homeVisitAreas) {
        const doctor = await this.getDoctorOrThrow(userId);
        const updated = await this.prisma.doctor.update({
            where: { id: doctor.id },
            data: { homeVisits, ...(homeVisitAreas !== undefined ? { homeVisitAreas } : {}) },
        });
        return { homeVisits: updated.homeVisits, homeVisitAreas: updated.homeVisitAreas };
    }
    async getAvailability(userId) {
        const doctor = await this.getDoctorOrThrow(userId);
        return this.prisma.availabilitySlot.findMany({ where: { doctorId: doctor.id }, orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }] });
    }
    async updateAvailability(userId, slots) {
        const doctor = await this.getDoctorOrThrow(userId);
        await this.prisma.availabilitySlot.deleteMany({ where: { doctorId: doctor.id } });
        if (slots.length > 0) {
            await this.prisma.availabilitySlot.createMany({
                data: slots.map(s => ({
                    doctorId: doctor.id,
                    dayOfWeek: s.dayOfWeek,
                    startTime: s.startTime,
                    endTime: s.endTime,
                    slotDurationMin: s.slotDurationMin ?? 30,
                    isActive: s.isActive ?? true,
                })),
            });
        }
        return this.prisma.availabilitySlot.findMany({ where: { doctorId: doctor.id }, orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }] });
    }
    async addCertification(userId, name, url) {
        const doctor = await this.getDoctorOrThrow(userId);
        const entry = `${name}::${url}`;
        const updated = await this.prisma.doctor.update({
            where: { id: doctor.id },
            data: { certificationUrls: { push: entry } },
        });
        return { certificationUrls: updated.certificationUrls };
    }
    async removeCertification(userId, index) {
        const doctor = await this.getDoctorOrThrow(userId);
        const urls = [...doctor.certificationUrls];
        if (index < 0 || index >= urls.length)
            throw new common_1.BadRequestException('Invalid index');
        urls.splice(index, 1);
        const updated = await this.prisma.doctor.update({ where: { id: doctor.id }, data: { certificationUrls: urls } });
        return { certificationUrls: updated.certificationUrls };
    }
    async getStats(userId) {
        const doctor = await this.getDoctorOrThrow(userId);
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - 7);
        const [total, pending, confirmed, completed, cancelled, revenue, upcoming, todayCount, weekCount, recentPayments] = await Promise.all([
            this.prisma.appointment.count({ where: { doctorId: doctor.id } }),
            this.prisma.appointment.count({ where: { doctorId: doctor.id, status: 'pending' } }),
            this.prisma.appointment.count({ where: { doctorId: doctor.id, status: 'confirmed' } }),
            this.prisma.appointment.count({ where: { doctorId: doctor.id, status: 'completed' } }),
            this.prisma.appointment.count({ where: { doctorId: doctor.id, status: 'cancelled' } }),
            this.prisma.appointment.aggregate({ where: { doctorId: doctor.id, paymentStatus: 'paid' }, _sum: { paymentAmount: true } }),
            this.prisma.appointment.findMany({
                where: { doctorId: doctor.id, status: { in: ['pending', 'confirmed'] }, appointmentDate: { gte: new Date() } },
                include: { patient: { select: { id: true, name: true, email: true, phone: true } } },
                orderBy: { appointmentDate: 'asc' },
                take: 5,
            }),
            this.prisma.appointment.count({ where: { doctorId: doctor.id, appointmentDate: { gte: todayStart } } }),
            this.prisma.appointment.count({ where: { doctorId: doctor.id, appointmentDate: { gte: weekStart } } }),
            this.prisma.appointment.findMany({
                where: { doctorId: doctor.id, paymentStatus: 'paid', status: 'completed' },
                select: { id: true, paymentAmount: true, appointmentDate: true, consultationType: true, patient: { select: { name: true } } },
                orderBy: { appointmentDate: 'desc' },
                take: 10,
            }),
        ]);
        return {
            total, pending, confirmed, completed, cancelled, todayCount, weekCount,
            revenue: Number(revenue._sum.paymentAmount ?? 0),
            rating: Number(doctor.rating),
            totalReviews: doctor.totalReviews,
            isOnline: doctor.isOnline,
            upcoming,
            recentPayments,
        };
    }
    // ── Appointments ──────────────────────────────────────────────────────────────
    async getAppointments(userId, status, page = 1, limit = 10) {
        const doctor = await this.getDoctorOrThrow(userId);
        const skip = (page - 1) * limit;
        const where = { doctorId: doctor.id, ...(status && status !== 'all' ? { status } : {}) };
        const [data, total] = await Promise.all([
            this.prisma.appointment.findMany({
                where, skip, take: limit,
                include: {
                    patient: { select: { id: true, name: true, email: true, phone: true } },
                    telehealthSessions: { select: { id: true, status: true, meetingUrl: true }, take: 1 },
                },
                orderBy: { appointmentDate: 'desc' },
            }),
            this.prisma.appointment.count({ where }),
        ]);
        return { success: true, data, total, page, pages: Math.ceil(total / limit) };
    }
    async updateAppointmentStatus(userId, appointmentId, status, newDate) {
        const doctor = await this.getDoctorOrThrow(userId);
        const appointment = await this.prisma.appointment.findFirst({
            where: { id: appointmentId, doctorId: doctor.id },
            include: { patient: { select: { id: true, name: true } } },
        });
        if (!appointment)
            throw new common_1.NotFoundException('Appointment not found');
        const updated = await this.prisma.appointment.update({
            where: { id: appointmentId },
            data: {
                status,
                ...(newDate ? { appointmentDate: new Date(newDate) } : {}),
            },
            include: { patient: { select: { id: true, name: true } } },
        });
        const doctorUser = await this.prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
        const apptDate = newDate ? new Date(newDate) : appointment.appointmentDate ? new Date(appointment.appointmentDate) : null;
        const dateStr = apptDate ? apptDate.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' }) : 'your appointment';
        if (status === 'confirmed') {
            await this.prisma.notification.create({
                data: {
                    userId: appointment.patientId,
                    title: 'Appointment Confirmed!',
                    body: `Dr. ${doctorUser?.name ?? 'Your doctor'} has confirmed your appointment on ${dateStr}.`,
                    type: 'appointment',
                },
            }).catch(() => { });
        }
        else if (status === 'cancelled') {
            await this.prisma.notification.create({
                data: {
                    userId: appointment.patientId,
                    title: 'Appointment Declined',
                    body: `Dr. ${doctorUser?.name ?? 'Your doctor'} has declined your appointment request for ${dateStr}. You may book another slot.`,
                    type: 'appointment',
                },
            }).catch(() => { });
        }
        return { success: true, data: updated };
    }
    // ── Patient Records ───────────────────────────────────────────────────────────
    async getPatientRecords(userId, patientId) {
        const doctor = await this.getDoctorOrThrow(userId);
        const hasAppointment = await this.prisma.appointment.findFirst({ where: { doctorId: doctor.id, patientId } });
        if (!hasAppointment)
            throw new common_1.ForbiddenException('No appointment found with this patient');
        const [patient, medicalHistory, medicalRecords, previousNotes, previousPrescriptions] = await Promise.all([
            this.prisma.user.findUnique({ where: { id: patientId }, select: { id: true, name: true, email: true, phone: true, createdAt: true } }),
            this.prisma.medicalHistory.findMany({ where: { patientId }, orderBy: { createdAt: 'desc' } }),
            this.prisma.medicalRecord.findMany({ where: { patientId }, orderBy: { createdAt: 'desc' }, take: 10 }),
            this.prisma.consultationNote.findMany({ where: { patientId, doctorId: doctor.id }, orderBy: { createdAt: 'desc' }, take: 5 }),
            this.prisma.prescription.findMany({
                where: { patientId, doctorId: doctor.id },
                include: { items: true },
                orderBy: { createdAt: 'desc' },
                take: 5,
            }),
        ]);
        return { success: true, data: { patient, medicalHistory, medicalRecords, previousNotes, previousPrescriptions } };
    }
    // ── Prescriptions ─────────────────────────────────────────────────────────────
    async issuePrescription(userId, data) {
        const doctor = await this.getDoctorOrThrow(userId);
        const hasAccess = await this.prisma.appointment.findFirst({ where: { doctorId: doctor.id, patientId: data.patientId } });
        if (!hasAccess)
            throw new common_1.ForbiddenException('No appointment found with this patient');
        let sessionId;
        if (data.appointmentId) {
            const existingSession = await this.prisma.telehealthSession.findFirst({ where: { appointmentId: data.appointmentId } });
            if (existingSession) {
                sessionId = existingSession.id;
            }
            else {
                const session = await this.prisma.telehealthSession.create({
                    data: { appointmentId: data.appointmentId, doctorId: doctor.id, patientId: data.patientId, status: 'completed' },
                });
                sessionId = session.id;
            }
        }
        else {
            const session = await this.prisma.telehealthSession.create({
                data: { doctorId: doctor.id, patientId: data.patientId, status: 'completed' },
            });
            sessionId = session.id;
        }
        const prescription = await this.prisma.prescription.create({
            data: {
                sessionId, doctorId: doctor.id, patientId: data.patientId, notes: data.notes,
                items: { create: data.items },
            },
            include: { items: true, patient: { select: { name: true, email: true } } },
        });
        return { success: true, data: prescription };
    }
    async getDoctorPrescriptions(userId, page = 1, limit = 10) {
        const doctor = await this.getDoctorOrThrow(userId);
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.prescription.findMany({
                where: { doctorId: doctor.id }, skip, take: limit,
                orderBy: { createdAt: 'desc' },
                include: { items: true, patient: { select: { id: true, name: true, email: true } } },
            }),
            this.prisma.prescription.count({ where: { doctorId: doctor.id } }),
        ]);
        return { success: true, data, total, page, pages: Math.ceil(total / limit) };
    }
    // ── Chat ─────────────────────────────────────────────────────────────────────
    async getMessages(userId) {
        const messages = await this.prisma.message.findMany({
            where: { OR: [{ senderId: userId }, { receiverId: userId }] },
            orderBy: { createdAt: 'desc' },
            include: {
                sender: { select: { id: true, name: true, role: true } },
                receiver: { select: { id: true, name: true, role: true } },
            },
            take: 100,
        });
        const conversations = {};
        messages.forEach(m => {
            const partnerId = m.senderId === userId ? m.receiverId : m.senderId;
            const partner = m.senderId === userId ? m.receiver : m.sender;
            if (!conversations[partnerId])
                conversations[partnerId] = { partner, messages: [] };
            conversations[partnerId].messages.push({ ...m, isMine: m.senderId === userId });
        });
        Object.values(conversations).forEach((c) => c.messages.reverse());
        return { success: true, data: Object.values(conversations) };
    }
    async sendMessage(userId, receiverId, message) {
        await this.getDoctorOrThrow(userId);
        const msg = await this.prisma.message.create({
            data: { senderId: userId, receiverId, message },
            include: {
                sender: { select: { id: true, name: true } },
                receiver: { select: { id: true, name: true } },
            },
        });
        return { success: true, data: msg };
    }
};
exports.DoctorPanelService = DoctorPanelService;
exports.DoctorPanelService = DoctorPanelService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DoctorPanelService);
