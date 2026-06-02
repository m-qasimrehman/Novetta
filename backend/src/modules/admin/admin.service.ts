import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../lib/prisma.service'

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  private async assertAdmin(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user || user.role !== 'admin') throw new ForbiddenException('Admin access required')
  }

  // ── Overview Stats ──────────────────────────────────────────────────────────

  async stats(userId: string, dateFrom?: string, dateTo?: string) {
    await this.assertAdmin(userId)
    const from = dateFrom ? new Date(dateFrom) : undefined
    const to   = dateTo   ? new Date(dateTo)   : undefined
    const dateFilter = (from || to) ? { createdAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {}

    const [users, doctors, appointments, orders, labBookings, memberships, couponAgg] = await Promise.all([
      this.prisma.user.count({ where: dateFilter }),
      this.prisma.doctor.count(),
      this.prisma.appointment.count({ where: dateFilter }),
      this.prisma.pharmacyOrder.count({ where: dateFilter }),
      this.prisma.labBooking.count({ where: dateFilter }),
      this.prisma.userMembership.count({ where: { status: 'active' } }),
      this.prisma.coupon.aggregate({ _sum: { usedCount: true } }),
    ])

    return {
      success: true,
      data: { users, doctors, appointments, orders, labBookings, memberships, couponUsage: couponAgg._sum.usedCount ?? 0 },
    }
  }

  // ── Revenue ─────────────────────────────────────────────────────────────────

  async revenue(userId: string) {
    await this.assertAdmin(userId)
    const [orderTotal, labTotal, membershipCount] = await Promise.all([
      this.prisma.pharmacyOrder.aggregate({ _sum: { totalAmount: true } }),
      this.prisma.labBooking.aggregate({ _sum: { amount: true } }),
      this.prisma.userMembership.count({ where: { status: 'active' } }),
    ])

    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const recentOrders = await this.prisma.pharmacyOrder.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { totalAmount: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    })

    const monthlyMap: Record<string, number> = {}
    recentOrders.forEach(o => {
      const key = new Date(o.createdAt).toISOString().slice(0, 7)
      monthlyMap[key] = (monthlyMap[key] ?? 0) + Number(o.totalAmount)
    })

    return {
      success: true,
      data: {
        pharmacy: Number(orderTotal._sum.totalAmount ?? 0),
        labs: Number(labTotal._sum.amount ?? 0),
        memberships: membershipCount * 299,
        total: Number(orderTotal._sum.totalAmount ?? 0) + Number(labTotal._sum.amount ?? 0),
        monthlyChart: Object.entries(monthlyMap).map(([month, amount]) => ({ month, amount })),
      },
    }
  }

  // ── Users ───────────────────────────────────────────────────────────────────

  async listUsers(userId: string, page = 1, limit = 20, role?: string, q?: string) {
    await this.assertAdmin(userId)
    const skip = (page - 1) * limit
    const where: any = {
      ...(role ? { role } : {}),
      ...(q ? { OR: [{ name: { contains: q, mode: 'insensitive' } }, { email: { contains: q, mode: 'insensitive' } }] } : {}),
    }
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where, skip, take: limit,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, phone: true, role: true, isVerified: true, isActive: true, createdAt: true },
      }),
      this.prisma.user.count({ where }),
    ])
    return { success: true, data, total, page, pages: Math.ceil(total / limit) }
  }

  async toggleUserActive(adminId: string, targetId: string) {
    await this.assertAdmin(adminId)
    const user = await this.prisma.user.findUnique({ where: { id: targetId } })
    if (!user) throw new NotFoundException('User not found')
    const updated = await this.prisma.user.update({
      where: { id: targetId },
      data: { isActive: !user.isActive },
      select: { id: true, isActive: true },
    })
    return { success: true, data: updated }
  }

  // ── Doctors ─────────────────────────────────────────────────────────────────

  async listDoctors(userId: string) {
    await this.assertAdmin(userId)
    return {
      success: true,
      data: await this.prisma.doctor.findMany({
        include: { user: { select: { name: true, email: true, isActive: true } } },
        orderBy: { createdAt: 'desc' },
      }),
    }
  }

  async verifyDoctor(adminId: string, doctorId: string) {
    await this.assertAdmin(adminId)
    const doctor = await this.prisma.doctor.findUnique({ where: { id: doctorId } })
    if (!doctor) throw new NotFoundException('Doctor not found')
    const nowVerified = !doctor.isVerified
    const updated = await this.prisma.doctor.update({
      where: { id: doctorId },
      data: { isVerified: nowVerified, verifiedAt: nowVerified ? new Date() : null },
      select: { id: true, isVerified: true, verifiedAt: true, userId: true },
    })

    // Notify the doctor of their approval/revocation status
    await this.prisma.notification.create({
      data: {
        userId: updated.userId,
        title: nowVerified ? 'Profile Approved!' : 'Profile Under Review',
        body: nowVerified
          ? 'Congratulations! Your doctor profile has been approved by Novetta. Patients can now find and book you.'
          : 'Your doctor profile has been placed back under review. Contact support for details.',
        type: 'system',
      },
    }).catch(() => {})

    return { success: true, data: updated }
  }

  // ── Membership Plans ────────────────────────────────────────────────────────

  async listPlans(userId: string) {
    await this.assertAdmin(userId)
    const plans = await this.prisma.membershipPlan.findMany({
      orderBy: { price: 'asc' },
      include: { _count: { select: { subscriptions: true } } },
    })
    return { success: true, data: plans }
  }

  async createPlan(userId: string, data: {
    name: string; description?: string; price: number; durationDays: number
    discountPct: number; features: string[]; freeDelivery?: boolean; maxAnnualSavings?: number
  }) {
    await this.assertAdmin(userId)
    const plan = await this.prisma.membershipPlan.create({ data })
    return { success: true, data: plan }
  }

  async updatePlan(userId: string, planId: string, data: Partial<{
    name: string; description: string; price: number; durationDays: number
    discountPct: number; features: string[]; isActive: boolean; freeDelivery: boolean; maxAnnualSavings: number
  }>) {
    await this.assertAdmin(userId)
    const plan = await this.prisma.membershipPlan.findUnique({ where: { id: planId } })
    if (!plan) throw new NotFoundException('Plan not found')
    return { success: true, data: await this.prisma.membershipPlan.update({ where: { id: planId }, data }) }
  }

  async deletePlan(userId: string, planId: string) {
    await this.assertAdmin(userId)
    const plan = await this.prisma.membershipPlan.findUnique({ where: { id: planId } })
    if (!plan) throw new NotFoundException('Plan not found')
    await this.prisma.membershipPlan.delete({ where: { id: planId } })
    return { success: true, message: 'Plan deleted' }
  }

  async membershipStats(userId: string) {
    await this.assertAdmin(userId)
    const [active, total, plans] = await Promise.all([
      this.prisma.userMembership.count({ where: { status: 'active', expiresAt: { gt: new Date() } } }),
      this.prisma.userMembership.count(),
      this.prisma.membershipPlan.findMany({ include: { _count: { select: { subscriptions: true } } } }),
    ])
    const churnRate = total > 0 ? (((total - active) / total) * 100).toFixed(1) : '0.0'
    return {
      success: true,
      data: {
        active, total, churnRate,
        plans: plans.map(p => ({ id: p.id, name: p.name, price: Number(p.price), subscribers: p._count.subscriptions })),
      },
    }
  }

  // ── Coupons ─────────────────────────────────────────────────────────────────

  async listCoupons(adminId: string) {
    await this.assertAdmin(adminId)
    return { success: true, data: await this.prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } }) }
  }

  async createCoupon(adminId: string, data: {
    code: string; description?: string; discountType: string; discountValue: number
    minAmount?: number; maxUses?: number; expiresAt?: string
  }) {
    await this.assertAdmin(adminId)
    const coupon = await this.prisma.coupon.create({
      data: {
        code: data.code.toUpperCase(), description: data.description,
        discountType: data.discountType, discountValue: data.discountValue,
        minAmount: data.minAmount, maxUses: data.maxUses,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      },
    })
    return { success: true, data: coupon }
  }

  async updateCoupon(adminId: string, couponId: string, data: { isActive?: boolean; maxUses?: number; expiresAt?: string }) {
    await this.assertAdmin(adminId)
    const coupon = await this.prisma.coupon.findUnique({ where: { id: couponId } })
    if (!coupon) throw new NotFoundException('Coupon not found')
    const updated = await this.prisma.coupon.update({
      where: { id: couponId },
      data: {
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
        ...(data.maxUses !== undefined ? { maxUses: data.maxUses } : {}),
        ...(data.expiresAt ? { expiresAt: new Date(data.expiresAt) } : {}),
      },
    })
    return { success: true, data: updated }
  }

  async deleteCoupon(adminId: string, couponId: string) {
    await this.assertAdmin(adminId)
    await this.prisma.coupon.findUnique({ where: { id: couponId } })
    await this.prisma.coupon.delete({ where: { id: couponId } })
    return { success: true, message: 'Coupon deleted' }
  }

  // ── Appointments Oversight ──────────────────────────────────────────────────

  async listAllAppointments(userId: string, status?: string, page = 1, limit = 20) {
    await this.assertAdmin(userId)
    const skip = (page - 1) * limit
    const where: any = status ? { status } : {}
    const [data, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where, skip, take: limit,
        include: {
          patient: { select: { name: true, email: true } },
          doctor: { select: { user: { select: { name: true } }, specialization: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.appointment.count({ where }),
    ])
    return { success: true, data, total, page, pages: Math.ceil(total / limit) }
  }

  // ── Orders Oversight ────────────────────────────────────────────────────────

  async listAllOrders(userId: string, type: 'pharmacy' | 'lab' = 'pharmacy', page = 1, limit = 20) {
    await this.assertAdmin(userId)
    const skip = (page - 1) * limit
    if (type === 'lab') {
      const [data, total] = await Promise.all([
        this.prisma.labBooking.findMany({
          skip, take: limit,
          include: { patient: { select: { name: true, email: true } }, test: { select: { name: true, price: true } } },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.labBooking.count(),
      ])
      return { success: true, data: data.map(d => ({ ...d, orderType: 'lab' })), total }
    }
    const [data, total] = await Promise.all([
      this.prisma.pharmacyOrder.findMany({
        skip, take: limit,
        include: {
          patient: { select: { name: true, email: true } },
          items: { include: { medicine: { select: { name: true } } }, take: 2 },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.pharmacyOrder.count(),
    ])
    return { success: true, data: data.map(d => ({ ...d, orderType: 'pharmacy' })), total }
  }

  // ── Payouts ─────────────────────────────────────────────────────────────────

  async getPayouts(userId: string) {
    await this.assertAdmin(userId)
    const doctors = await this.prisma.doctor.findMany({
      include: {
        user: { select: { name: true, email: true } },
        appointments: { where: { paymentStatus: 'paid' }, select: { paymentAmount: true, createdAt: true } },
      },
    })
    const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000)
    return {
      success: true,
      data: {
        doctors: doctors.map(d => ({
          id: d.id, name: d.user.name, email: d.user.email, specialization: d.specialization,
          totalEarnings: d.appointments.reduce((s, a) => s + Number(a.paymentAmount ?? 0), 0),
          appointmentCount: d.appointments.length,
          pendingPayout: d.appointments
            .filter(a => new Date(a.createdAt) > weekAgo)
            .reduce((s, a) => s + Number(a.paymentAmount ?? 0), 0),
        })),
      },
    }
  }

  // ── Online Users ─────────────────────────────────────────────────────────────

  async getOnlineUsers(userId: string) {
    await this.assertAdmin(userId)
    const onlineDoctors = await this.prisma.doctor.findMany({
      where: { isOnline: true },
      include: { user: { select: { name: true, email: true } } },
    })
    return { success: true, data: { onlineDoctors, count: onlineDoctors.length } }
  }

  // ── Pharmacy Management ──────────────────────────────────────────────────────

  async listPharmacies(userId: string) {
    await this.assertAdmin(userId)
    const pharmacies = await this.prisma.pharmacy.findMany({
      include: {
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    const results = await Promise.all(pharmacies.map(async p => {
      const owner = p.ownerId ? await this.prisma.user.findUnique({ where: { id: p.ownerId }, select: { name: true, email: true } }) : null
      return { ...p, owner }
    }))
    return { success: true, data: results }
  }

  async togglePharmacyActive(adminId: string, pharmacyId: string) {
    await this.assertAdmin(adminId)
    const pharmacy = await this.prisma.pharmacy.findUnique({ where: { id: pharmacyId } })
    if (!pharmacy) throw new NotFoundException('Pharmacy not found')
    const updated = await this.prisma.pharmacy.update({ where: { id: pharmacyId }, data: { isActive: !pharmacy.isActive } })
    return { success: true, data: updated }
  }

  // ── Lab Centers Management ───────────────────────────────────────────────────

  async listLabCenters(userId: string) {
    await this.assertAdmin(userId)
    const centers = await this.prisma.labCenter.findMany({
      include: { _count: { select: { bookings: true, tests: true } } },
      orderBy: { createdAt: 'desc' },
    })
    const results = await Promise.all(centers.map(async c => {
      const owner = c.ownerId ? await this.prisma.user.findUnique({ where: { id: c.ownerId }, select: { name: true, email: true } }) : null
      return { ...c, owner }
    }))
    return { success: true, data: results }
  }

  async toggleLabActive(adminId: string, centerId: string) {
    await this.assertAdmin(adminId)
    const center = await this.prisma.labCenter.findUnique({ where: { id: centerId } })
    if (!center) throw new NotFoundException('Lab center not found')
    const updated = await this.prisma.labCenter.update({ where: { id: centerId }, data: { isActive: !center.isActive } })
    return { success: true, data: updated }
  }

  // ── Activity ─────────────────────────────────────────────────────────────────

  async recentActivity(userId: string) {
    await this.assertAdmin(userId)
    const [recentUsers, recentAppointments, recentOrders] = await Promise.all([
      this.prisma.user.findMany({ take: 5, orderBy: { createdAt: 'desc' }, select: { id: true, name: true, email: true, createdAt: true, role: true } }),
      this.prisma.appointment.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { patient: { select: { name: true } }, doctor: { select: { user: { select: { name: true } } } } } }),
      this.prisma.pharmacyOrder.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { patient: { select: { name: true } } } }),
    ])
    return { success: true, data: { recentUsers, recentAppointments, recentOrders } }
  }
}
