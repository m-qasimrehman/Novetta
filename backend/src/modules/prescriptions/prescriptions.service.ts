import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../../lib/prisma.service'

@Injectable()
export class PrescriptionsService {
  constructor(private prisma: PrismaService) {}

  async listForPatient(patientId: string) {
    const prescriptions = await this.prisma.prescription.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        doctor: { include: { user: { select: { id: true, name: true } } } },
        session: { select: { id: true, createdAt: true, appointmentId: true } },
      },
    })
    return { success: true, data: prescriptions }
  }

  async findOne(id: string, patientId: string) {
    const prescription = await this.prisma.prescription.findUnique({
      where: { id },
      include: {
        items: true,
        doctor: { include: { user: { select: { id: true, name: true } } } },
        patient: { select: { id: true, name: true, email: true, phone: true } },
        session: {
          include: {
            appointment: { select: { id: true, consultationType: true, appointmentDate: true, confirmationCode: true } },
          },
        },
      },
    })
    if (!prescription) throw new NotFoundException('Prescription not found')
    if (prescription.patientId !== patientId) throw new ForbiddenException('Access denied')
    return { success: true, data: prescription }
  }
}
