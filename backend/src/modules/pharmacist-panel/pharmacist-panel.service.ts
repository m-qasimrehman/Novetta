import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../lib/prisma.service'
import { createHmac } from 'crypto'

const SIG_SECRET = process.env.SIGNATURE_SECRET ?? 'novetta-pharma-sig-secret-2024'

@Injectable()
export class PharmacistPanelService {
  constructor(private prisma: PrismaService) {}

  private async assertPharmacist(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user || user.role !== 'pharmacist') throw new ForbiddenException('Pharmacist access required')
    return user
  }

  // ── Patient Queue ──────────────────────────────────────────────────────────────

  async getQueue(pharmacistId: string) {
    await this.assertPharmacist(pharmacistId)
    const sessions = await this.prisma.pharmacistSession.findMany({
      where: { status: { in: ['waiting', 'active'] } },
      include: { patient: { select: { id: true, name: true, email: true, phone: true } } },
      orderBy: { createdAt: 'asc' },
    })
    return { success: true, data: sessions }
  }

  async acceptSession(pharmacistId: string, sessionId: string) {
    await this.assertPharmacist(pharmacistId)
    const session = await this.prisma.pharmacistSession.findUnique({ where: { id: sessionId } })
    if (!session) throw new NotFoundException('Session not found')
    if (session.status !== 'waiting') throw new ForbiddenException('Session is not in waiting state')
    const updated = await this.prisma.pharmacistSession.update({
      where: { id: sessionId },
      data: { pharmacistId, status: 'active' },
      include: { patient: { select: { id: true, name: true, email: true, phone: true } } },
    })
    return { success: true, data: updated }
  }

  async completeSession(pharmacistId: string, sessionId: string, notes?: string) {
    await this.assertPharmacist(pharmacistId)
    const session = await this.prisma.pharmacistSession.findUnique({ where: { id: sessionId } })
    if (!session || session.pharmacistId !== pharmacistId) throw new ForbiddenException('Session not found')
    const updated = await this.prisma.pharmacistSession.update({
      where: { id: sessionId },
      data: { status: 'completed', sessionNotes: notes, completedAt: new Date() },
    })
    return { success: true, data: updated }
  }

  async getMyActiveSessions(pharmacistId: string) {
    await this.assertPharmacist(pharmacistId)
    const sessions = await this.prisma.pharmacistSession.findMany({
      where: { pharmacistId, status: 'active' },
      include: { patient: { select: { id: true, name: true, email: true, phone: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return { success: true, data: sessions }
  }

  // ── Digital Signature + E-Prescription ───────────────────────────────────────

  async issuePrescriptionWithSignature(pharmacistId: string, sessionId: string, data: {
    patientId: string
    notes?: string
    sessionNotes?: string
    items: { medicineName: string; dosage?: string; frequency?: string; duration?: string; instructions?: string }[]
  }) {
    const pharmacist = await this.assertPharmacist(pharmacistId)
    const session = await this.prisma.pharmacistSession.findUnique({ where: { id: sessionId } })
    if (!session || session.pharmacistId !== pharmacistId) throw new ForbiddenException('Session not found')

    // Auto-create a telehealth session to satisfy the prescription FK
    const telehealthSession = await this.prisma.telehealthSession.create({
      data: { doctorId: pharmacistId, patientId: data.patientId, status: 'completed' },
    })

    const prescription = await this.prisma.prescription.create({
      data: {
        sessionId: telehealthSession.id,
        doctorId: pharmacistId,
        patientId: data.patientId,
        notes: data.notes,
        items: { create: data.items },
      },
      include: { items: true, patient: { select: { name: true, email: true } } },
    })

    // Generate HMAC-SHA256 digital signature
    const timestamp = new Date().toISOString()
    const payload = `${sessionId}:${pharmacistId}:${prescription.id}:${timestamp}`
    const signatureHash = createHmac('sha256', SIG_SECRET).update(payload).digest('hex')

    await this.prisma.pharmacistSession.update({
      where: { id: sessionId },
      data: { signatureHash, signedAt: new Date(), sessionNotes: data.sessionNotes, status: 'completed', completedAt: new Date() },
    })

    return {
      success: true,
      data: {
        prescription,
        signature: {
          hash: signatureHash,
          timestamp,
          pharmacistName: pharmacist.name,
          pharmacistId,
          sessionId,
          prescriptionId: prescription.id,
          algorithm: 'HMAC-SHA256',
          status: 'verified',
        },
      },
    }
  }

  // ── Inventory ─────────────────────────────────────────────────────────────────

  async getInventory(pharmacistId: string, pharmacyId: string) {
    await this.assertPharmacist(pharmacistId)
    const items = await this.prisma.pharmacyInventory.findMany({
      where: { pharmacyId },
      include: { medicine: { select: { id: true, name: true, genericName: true, category: true, prescriptionRequired: true } } },
      orderBy: { medicine: { name: 'asc' } },
    })
    return { success: true, data: items }
  }

  async upsertInventory(pharmacistId: string, pharmacyId: string, medicineId: string, stock: number, price: number, lowThreshold?: number) {
    await this.assertPharmacist(pharmacistId)
    const item = await this.prisma.pharmacyInventory.upsert({
      where: { pharmacyId_medicineId: { pharmacyId, medicineId } },
      create: { pharmacyId, medicineId, stock, price, lowThreshold: lowThreshold ?? 5 },
      update: { stock, price, ...(lowThreshold !== undefined ? { lowThreshold } : {}) },
      include: { medicine: { select: { id: true, name: true } } },
    })
    return { success: true, data: item }
  }

  async getMyPharmacy(pharmacistId: string) {
    await this.assertPharmacist(pharmacistId)
    const pharmacist = await this.prisma.user.findUnique({ where: { id: pharmacistId } })
    // Find pharmacy owned by this user
    const pharmacy = await this.prisma.pharmacy.findFirst({ where: { ownerId: pharmacistId } })
    return { success: true, data: pharmacy, pharmacist: { id: pharmacist?.id, name: pharmacist?.name, email: pharmacist?.email } }
  }

  // ── Orders ────────────────────────────────────────────────────────────────────

  async getOrders(pharmacistId: string, pharmacyId?: string, status?: string, page = 1, limit = 10) {
    await this.assertPharmacist(pharmacistId)
    const skip = (page - 1) * limit
    const where: any = {
      ...(pharmacyId ? { pharmacyId } : {}),
      ...(status && status !== 'all' ? { status } : {}),
    }
    const [data, total] = await Promise.all([
      this.prisma.pharmacyOrder.findMany({
        where, skip, take: limit,
        include: {
          patient: { select: { id: true, name: true, email: true, phone: true } },
          prescription: { include: { items: true } },
          items: { include: { medicine: { select: { id: true, name: true } } } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.pharmacyOrder.count({ where }),
    ])
    return { success: true, data, total, page, pages: Math.ceil(total / limit) }
  }

  async updateOrderStatus(pharmacistId: string, orderId: string, status: string) {
    await this.assertPharmacist(pharmacistId)
    const order = await this.prisma.pharmacyOrder.findUnique({ where: { id: orderId } })
    if (!order) throw new NotFoundException('Order not found')
    const updated = await this.prisma.pharmacyOrder.update({
      where: { id: orderId },
      data: { status },
      include: { patient: { select: { name: true } } },
    })
    return { success: true, data: updated }
  }

  async validatePrescription(pharmacistId: string, orderId: string, approved: boolean, note?: string) {
    await this.assertPharmacist(pharmacistId)
    const order = await this.prisma.pharmacyOrder.findUnique({ where: { id: orderId } })
    if (!order) throw new NotFoundException('Order not found')
    const updated = await this.prisma.pharmacyOrder.update({
      where: { id: orderId },
      data: {
        prescriptionStatus: approved ? 'approved' : 'rejected',
        prescriptionNote: note,
        status: approved ? order.status : 'cancelled',
      },
    })
    return { success: true, data: updated }
  }

  // ── Chat ─────────────────────────────────────────────────────────────────────

  async getSessionMessages(pharmacistId: string, patientId: string) {
    await this.assertPharmacist(pharmacistId)
    const messages = await this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: pharmacistId, receiverId: patientId },
          { senderId: patientId, receiverId: pharmacistId },
        ],
      },
      orderBy: { createdAt: 'asc' },
      include: { sender: { select: { id: true, name: true, role: true } } },
    })
    return { success: true, data: messages.map(m => ({ ...m, isMine: m.senderId === pharmacistId })) }
  }

  async sendMessage(pharmacistId: string, receiverId: string, message: string) {
    await this.assertPharmacist(pharmacistId)
    const msg = await this.prisma.message.create({
      data: { senderId: pharmacistId, receiverId, message },
      include: { sender: { select: { id: true, name: true } } },
    })
    return { success: true, data: msg }
  }

  // ── Patient Records ───────────────────────────────────────────────────────────

  async getPatientSummary(pharmacistId: string, patientId: string) {
    await this.assertPharmacist(pharmacistId)
    const [patient, medicalHistory, recentPrescriptions] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: patientId }, select: { id: true, name: true, email: true, phone: true } }),
      this.prisma.medicalHistory.findMany({ where: { patientId, isCurrent: true }, take: 5 }),
      this.prisma.prescription.findMany({
        where: { patientId }, take: 3, orderBy: { createdAt: 'desc' },
        include: { items: true, doctor: { include: { user: { select: { name: true } } } } },
      }),
    ])
    return { success: true, data: { patient, medicalHistory, recentPrescriptions } }
  }
}
