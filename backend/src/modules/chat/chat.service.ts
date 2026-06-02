import { Injectable, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../../lib/prisma.service'

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  // ── Guardrail: 3 free messages per 48 h unless active appointment exists ──────
  private async checkPatientGuardrail(patientId: string, doctorUserId: string) {
    const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000)

    // Find the doctor record for this user
    const doctor = await this.prisma.doctor.findUnique({ where: { userId: doctorUserId } })
    if (!doctor) throw new ForbiddenException('Doctor not found')

    // Active appointment grants unlimited chat
    const activeAppt = await this.prisma.appointment.findFirst({
      where: {
        patientId,
        doctorId: doctor.id,
        status: { in: ['confirmed', 'pending'] },
      },
    })
    if (activeAppt) return // unlimited

    // Count messages sent by patient to this doctor in last 48 h
    const recentCount = await this.prisma.message.count({
      where: {
        senderId: patientId,
        receiverId: doctorUserId,
        createdAt: { gte: cutoff },
      },
    })
    if (recentCount >= 3) {
      throw new ForbiddenException(
        'Free chat limit reached (3 messages per 48 hours). Book an appointment to continue chatting.'
      )
    }
  }

  async getConversation(userId: string, partnerId: string) {
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
    })
    return {
      success: true,
      data: messages.map(m => ({ ...m, isMine: m.senderId === userId })),
    }
  }

  async sendMessage(senderId: string, receiverId: string, message: string) {
    // Check if sender is a patient (not doctor/admin/pharmacist)
    const sender = await this.prisma.user.findUnique({ where: { id: senderId } })
    if (sender?.role === 'patient') {
      await this.checkPatientGuardrail(senderId, receiverId)
    }

    const msg = await this.prisma.message.create({
      data: { senderId, receiverId, message },
      include: { sender: { select: { id: true, name: true } } },
    })
    return { success: true, data: msg }
  }

  async getMessageCount(patientId: string, doctorUserId: string) {
    const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000)
    const count = await this.prisma.message.count({
      where: {
        senderId: patientId,
        receiverId: doctorUserId,
        createdAt: { gte: cutoff },
      },
    })

    const doctor = await this.prisma.doctor.findUnique({ where: { userId: doctorUserId } })
    const hasActiveAppt = doctor
      ? !!(await this.prisma.appointment.findFirst({
          where: { patientId, doctorId: doctor.id, status: { in: ['confirmed', 'pending'] } },
        }))
      : false

    return { success: true, data: { count, hasActiveAppt, limit: 3 } }
  }
}
