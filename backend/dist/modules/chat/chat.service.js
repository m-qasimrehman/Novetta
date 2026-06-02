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
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../lib/prisma.service");
let ChatService = class ChatService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    // ── Guardrail: 3 free messages per 48 h unless active appointment exists ──────
    async checkPatientGuardrail(patientId, doctorUserId) {
        const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);
        // Find the doctor record for this user
        const doctor = await this.prisma.doctor.findUnique({ where: { userId: doctorUserId } });
        if (!doctor)
            throw new common_1.ForbiddenException('Doctor not found');
        // Active appointment grants unlimited chat
        const activeAppt = await this.prisma.appointment.findFirst({
            where: {
                patientId,
                doctorId: doctor.id,
                status: { in: ['confirmed', 'pending'] },
            },
        });
        if (activeAppt)
            return; // unlimited
        // Count messages sent by patient to this doctor in last 48 h
        const recentCount = await this.prisma.message.count({
            where: {
                senderId: patientId,
                receiverId: doctorUserId,
                createdAt: { gte: cutoff },
            },
        });
        if (recentCount >= 3) {
            throw new common_1.ForbiddenException('Free chat limit reached (3 messages per 48 hours). Book an appointment to continue chatting.');
        }
    }
    async getConversation(userId, partnerId) {
        const messages = await this.prisma.message.findMany({
            where: {
                OR: [
                    { senderId: userId, receiverId: partnerId },
                    { senderId: partnerId, receiverId: userId },
                ],
            },
            orderBy: { createdAt: 'asc' },
            include: {
                sender: { select: { id: true, name: true } },
            },
        });
        return {
            success: true,
            data: messages.map(m => ({ ...m, isMine: m.senderId === userId })),
        };
    }
    async sendMessage(senderId, receiverId, message) {
        // Check if sender is a patient (not doctor/admin/pharmacist)
        const sender = await this.prisma.user.findUnique({ where: { id: senderId } });
        if (sender?.role === 'patient') {
            await this.checkPatientGuardrail(senderId, receiverId);
        }
        const msg = await this.prisma.message.create({
            data: { senderId, receiverId, message },
            include: { sender: { select: { id: true, name: true } } },
        });
        return { success: true, data: msg };
    }
    async getMessageCount(patientId, doctorUserId) {
        const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);
        const count = await this.prisma.message.count({
            where: {
                senderId: patientId,
                receiverId: doctorUserId,
                createdAt: { gte: cutoff },
            },
        });
        const doctor = await this.prisma.doctor.findUnique({ where: { userId: doctorUserId } });
        const hasActiveAppt = doctor
            ? !!(await this.prisma.appointment.findFirst({
                where: { patientId, doctorId: doctor.id, status: { in: ['confirmed', 'pending'] } },
            }))
            : false;
        return { success: true, data: { count, hasActiveAppt, limit: 3 } };
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ChatService);
