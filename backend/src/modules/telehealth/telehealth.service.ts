import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../../lib/prisma.service'

@Injectable()
export class TelehealthService {
  constructor(private prisma: PrismaService) {}

  async getSession(id: string, userId: string) {
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
    })
    if (!session) throw new NotFoundException('Session not found')
    if (session.patientId !== userId && session.doctor.userId !== userId) {
      throw new ForbiddenException('Access denied')
    }
    return { success: true, data: session }
  }

  async startSession(appointmentId: string, userId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { doctor: true, telehealthSessions: true },
    })
    if (!appointment) throw new NotFoundException('Appointment not found')

    let session = appointment.telehealthSessions[0]
    if (!session) {
      const roomCode = Math.random().toString(36).substring(2, 10).toUpperCase()
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
      })
    } else if (session.status === 'scheduled') {
      session = await this.prisma.telehealthSession.update({
        where: { id: session.id },
        data: { status: 'active', startedAt: new Date() },
      })
    }

    return { success: true, data: session }
  }

  async endSession(id: string, userId: string) {
    const session = await this.prisma.telehealthSession.findUnique({ where: { id }, include: { doctor: true } })
    if (!session) throw new NotFoundException('Session not found')
    if (session.doctor.userId !== userId && session.patientId !== userId) throw new ForbiddenException('Access denied')

    const updated = await this.prisma.telehealthSession.update({
      where: { id },
      data: { status: 'completed', endedAt: new Date() },
    })
    return { success: true, message: 'Session ended', data: updated }
  }

  async addConsultationNote(sessionId: string, doctorUserId: string, data: { diagnosis?: string; notes?: string }) {
    const session = await this.prisma.telehealthSession.findUnique({ where: { id: sessionId }, include: { doctor: true } })
    if (!session) throw new NotFoundException('Session not found')
    if (session.doctor.userId !== doctorUserId) throw new ForbiddenException('Only the doctor can add notes')

    const note = await this.prisma.consultationNote.create({
      data: {
        sessionId,
        doctorId: session.doctorId,
        patientId: session.patientId,
        ...data,
      },
    })
    return { success: true, data: note }
  }

  async addPrescription(
    sessionId: string,
    doctorUserId: string,
    data: {
      notes?: string
      items: { medicineName: string; dosage?: string; frequency?: string; duration?: string; instructions?: string }[]
    },
  ) {
    const session = await this.prisma.telehealthSession.findUnique({ where: { id: sessionId }, include: { doctor: true } })
    if (!session) throw new NotFoundException('Session not found')
    if (session.doctor.userId !== doctorUserId) throw new ForbiddenException('Only the doctor can prescribe')

    const prescription = await this.prisma.prescription.create({
      data: {
        sessionId,
        doctorId: session.doctorId,
        patientId: session.patientId,
        notes: data.notes,
        items: { create: data.items },
      },
      include: { items: true },
    })
    return { success: true, data: prescription }
  }

  async addLabOrder(sessionId: string, doctorUserId: string, data: { testName: string; instructions?: string }) {
    const session = await this.prisma.telehealthSession.findUnique({ where: { id: sessionId }, include: { doctor: true } })
    if (!session) throw new NotFoundException('Session not found')
    if (session.doctor.userId !== doctorUserId) throw new ForbiddenException('Only the doctor can order tests')

    const order = await this.prisma.labOrder.create({
      data: {
        sessionId,
        doctorId: session.doctorId,
        patientId: session.patientId,
        ...data,
      },
    })
    return { success: true, data: order }
  }

  async listForPatient(patientId: string) {
    const sessions = await this.prisma.telehealthSession.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
      include: {
        doctor: { include: { user: { select: { id: true, name: true } } } },
        appointment: { select: { id: true, consultationType: true, appointmentDate: true } },
        prescriptions: { include: { items: true } },
      },
    })
    return { success: true, data: sessions }
  }
}
