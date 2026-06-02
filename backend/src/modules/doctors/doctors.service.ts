import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../lib/prisma.service'

@Injectable()
export class DoctorsService {
  constructor(private prisma: PrismaService) {}

  async search(filters: {
    q?: string
    specialization?: string
    city?: string
    consultationType?: string
    minRating?: number
    minExperience?: number
    maxFee?: number
    page?: number
    limit?: number
  }) {
    const { q, specialization, city, consultationType, minRating = 0, minExperience = 0, maxFee, page = 1, limit = 12 } = filters
    const skip = (page - 1) * limit

    const where: any = {
      isVerified: true,
      AND: [
        specialization ? { specialization: { contains: specialization, mode: 'insensitive' } } : {},
        city ? { city: { contains: city, mode: 'insensitive' } } : {},
        consultationType ? { consultationTypes: { has: consultationType } } : {},
        minRating > 0 ? { rating: { gte: minRating } } : {},
        minExperience > 0 ? { experience: { gte: minExperience } } : {},
        maxFee ? { consultationFee: { lte: maxFee } } : {},
        q ? {
          OR: [
            { specialization: { contains: q, mode: 'insensitive' } },
            { about: { contains: q, mode: 'insensitive' } },
            { city: { contains: q, mode: 'insensitive' } },
            { user: { name: { contains: q, mode: 'insensitive' } } },
          ],
        } : {},
      ],
    }

    const [doctors, total] = await Promise.all([
      this.prisma.doctor.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ rating: 'desc' }, { totalReviews: 'desc' }],
        include: {
          user: { select: { id: true, name: true, email: true } },
          _count: { select: { appointments: true, reviews: true } },
        },
      }),
      this.prisma.doctor.count({ where }),
    ])

    return {
      doctors,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    }
  }

  async findById(id: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        availabilitySlots: { where: { isActive: true }, orderBy: { dayOfWeek: 'asc' } },
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { patient: { select: { id: true, name: true } } },
        },
        _count: { select: { appointments: true } },
      },
    })
    if (!doctor) throw new NotFoundException('Doctor not found')
    return doctor
  }

  async getAvailableSlots(doctorId: string, date: string) {
    const doctor = await this.prisma.doctor.findUnique({ where: { id: doctorId } })
    if (!doctor) throw new NotFoundException('Doctor not found')

    const targetDate = new Date(date)
    const dayOfWeek = targetDate.getDay()

    const slots = await this.prisma.availabilitySlot.findMany({
      where: { doctorId, dayOfWeek, isActive: true },
    })

    // get already booked appointments for that day
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const booked = await this.prisma.appointment.findMany({
      where: {
        doctorId,
        appointmentDate: { gte: startOfDay, lte: endOfDay },
        status: { in: ['pending', 'confirmed'] },
      },
      select: { appointmentDate: true },
    })

    const bookedTimes = new Set(booked.map(a => a.appointmentDate?.toISOString().substring(11, 16)))

    const available: { slotId: string; time: string; available: boolean }[] = []
    for (const slot of slots) {
      // generate time slots within the range
      const [startH, startM] = slot.startTime.split(':').map(Number)
      const [endH, endM] = slot.endTime.split(':').map(Number)
      let current = startH * 60 + startM
      const end = endH * 60 + endM

      while (current + slot.slotDurationMin <= end) {
        const h = String(Math.floor(current / 60)).padStart(2, '0')
        const m = String(current % 60).padStart(2, '0')
        const timeStr = `${h}:${m}`
        available.push({ slotId: slot.id, time: timeStr, available: !bookedTimes.has(timeStr) })
        current += slot.slotDurationMin
      }
    }

    return { date, slots: available }
  }

  async addReview(doctorId: string, patientId: string, data: { rating: number; comment?: string; appointmentId?: string }) {
    const doctor = await this.prisma.doctor.findUnique({ where: { id: doctorId } })
    if (!doctor) throw new NotFoundException('Doctor not found')

    const review = await this.prisma.doctorReview.create({
      data: { doctorId, patientId, ...data },
      include: { patient: { select: { id: true, name: true } } },
    })

    // recalculate rating
    const agg = await this.prisma.doctorReview.aggregate({
      where: { doctorId },
      _avg: { rating: true },
      _count: { rating: true },
    })

    await this.prisma.doctor.update({
      where: { id: doctorId },
      data: {
        rating: agg._avg.rating ?? 0,
        totalReviews: agg._count.rating,
      },
    })

    return review
  }

  async getSpecializations() {
    const result = await this.prisma.doctor.findMany({
      where: { specialization: { not: null } },
      select: { specialization: true },
      distinct: ['specialization'],
    })
    return result.map(d => d.specialization).filter(Boolean)
  }

  async getCities() {
    const result = await this.prisma.doctor.findMany({
      where: { city: { not: null } },
      select: { city: true },
      distinct: ['city'],
    })
    return result.map(d => d.city).filter(Boolean)
  }
}
