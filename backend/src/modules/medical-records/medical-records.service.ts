import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../../lib/prisma.service'

@Injectable()
export class MedicalRecordsService {
  constructor(private prisma: PrismaService) {}

  async list(patientId: string) {
    const records = await this.prisma.medicalRecord.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
    })
    return { success: true, data: records }
  }

  async create(patientId: string, data: { title: string; description?: string; recordType?: string; fileUrl?: string }) {
    const record = await this.prisma.medicalRecord.create({
      data: { patientId, ...data },
    })
    return { success: true, data: record }
  }

  async delete(id: string, patientId: string) {
    const record = await this.prisma.medicalRecord.findUnique({ where: { id } })
    if (!record) throw new NotFoundException('Record not found')
    if (record.patientId !== patientId) throw new ForbiddenException('Access denied')
    await this.prisma.medicalRecord.delete({ where: { id } })
    return { success: true, message: 'Record deleted' }
  }
}
