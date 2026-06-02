import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../../lib/prisma.service'

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async getFullProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        medicalHistory: { orderBy: { createdAt: 'desc' } },
        dependents: { orderBy: { createdAt: 'desc' } },
        medicalRecords: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    })
    if (!user) throw new NotFoundException('User not found')
    const { passwordHash: _, ...safe } = user as any
    return { success: true, data: safe }
  }

  async updateProfile(userId: string, data: { name?: string; phone?: string }) {
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, name: true, email: true, phone: true, role: true, isVerified: true, createdAt: true },
    })
    return { success: true, data: updated }
  }

  // Medical History
  async addMedicalHistory(userId: string, data: { condition: string; diagnosedAt?: string; notes?: string }) {
    const entry = await this.prisma.medicalHistory.create({
      data: {
        patientId: userId,
        condition: data.condition,
        diagnosedAt: data.diagnosedAt ? new Date(data.diagnosedAt) : undefined,
        notes: data.notes,
      },
    })
    return { success: true, data: entry }
  }

  async listMedicalHistory(userId: string) {
    const history = await this.prisma.medicalHistory.findMany({
      where: { patientId: userId },
      orderBy: { createdAt: 'desc' },
    })
    return { success: true, data: history }
  }

  async deleteMedicalHistory(id: string, userId: string) {
    const entry = await this.prisma.medicalHistory.findUnique({ where: { id } })
    if (!entry) throw new NotFoundException('Entry not found')
    if (entry.patientId !== userId) throw new ForbiddenException('Access denied')
    await this.prisma.medicalHistory.delete({ where: { id } })
    return { success: true, message: 'Entry deleted' }
  }

  // Dependents
  async addDependent(userId: string, data: { name: string; relationship: string; dateOfBirth?: string; gender?: string; bloodGroup?: string }) {
    const dependent = await this.prisma.dependent.create({
      data: {
        userId,
        name: data.name,
        relationship: data.relationship,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        gender: data.gender,
        bloodGroup: data.bloodGroup,
      },
    })
    return { success: true, data: dependent }
  }

  async listDependents(userId: string) {
    const dependents = await this.prisma.dependent.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
    return { success: true, data: dependents }
  }

  async deleteDependent(id: string, userId: string) {
    const dep = await this.prisma.dependent.findUnique({ where: { id } })
    if (!dep) throw new NotFoundException('Dependent not found')
    if (dep.userId !== userId) throw new ForbiddenException('Access denied')
    await this.prisma.dependent.delete({ where: { id } })
    return { success: true, message: 'Dependent removed' }
  }

  // Saved Addresses
  async listAddresses(userId: string) {
    const addresses = await this.prisma.savedAddress.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    })
    return { success: true, data: addresses }
  }

  async addAddress(userId: string, data: { label: string; address: string; city?: string; isDefault?: boolean }) {
    if (data.isDefault) {
      await this.prisma.savedAddress.updateMany({ where: { userId }, data: { isDefault: false } })
    }
    const addr = await this.prisma.savedAddress.create({
      data: { userId, label: data.label, address: data.address, city: data.city, isDefault: data.isDefault ?? false },
    })
    return { success: true, data: addr }
  }

  async setDefaultAddress(id: string, userId: string) {
    const addr = await this.prisma.savedAddress.findUnique({ where: { id } })
    if (!addr || addr.userId !== userId) throw new NotFoundException('Address not found')
    await this.prisma.savedAddress.updateMany({ where: { userId }, data: { isDefault: false } })
    await this.prisma.savedAddress.update({ where: { id }, data: { isDefault: true } })
    return { success: true, message: 'Default address updated' }
  }

  async deleteAddress(id: string, userId: string) {
    const addr = await this.prisma.savedAddress.findUnique({ where: { id } })
    if (!addr || addr.userId !== userId) throw new NotFoundException('Address not found')
    await this.prisma.savedAddress.delete({ where: { id } })
    return { success: true, message: 'Address removed' }
  }
}
