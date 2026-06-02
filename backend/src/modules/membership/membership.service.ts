import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../lib/prisma.service'

@Injectable()
export class MembershipService {
  constructor(private prisma: PrismaService) {}

  async listPlans() {
    return this.prisma.membershipPlan.findMany({ where: { isActive: true }, orderBy: { price: 'asc' } })
  }

  async subscribe(userId: string, planId: string) {
    const plan = await this.prisma.membershipPlan.findUnique({ where: { id: planId } })
    if (!plan) throw new NotFoundException('Plan not found')
    const active = await this.prisma.userMembership.findFirst({ where: { userId, status: 'active', expiresAt: { gt: new Date() } } })
    if (active) throw new BadRequestException('You already have an active membership')
    const expiresAt = new Date(Date.now() + plan.durationDays * 24 * 3600 * 1000)
    return this.prisma.userMembership.create({ data: { userId, planId, status: 'active', expiresAt }, include: { plan: true } })
  }

  async myMembership(userId: string) {
    return this.prisma.userMembership.findFirst({
      where: { userId, status: 'active', expiresAt: { gt: new Date() } },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  async listCoupons() {
    return this.prisma.coupon.findMany({
      where: { isActive: true, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
    })
  }

  async applyCoupon(code: string, amount: number) {
    const coupon = await this.prisma.coupon.findFirst({
      where: { code: code.toUpperCase(), isActive: true, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
    })
    if (!coupon) throw new NotFoundException('Invalid or expired coupon code')
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) throw new BadRequestException('Coupon usage limit reached')
    if (coupon.minAmount && amount < Number(coupon.minAmount)) {
      throw new BadRequestException(`Minimum order amount for this coupon is ₹${coupon.minAmount}`)
    }
    const discount = coupon.discountType === 'percentage'
      ? (amount * Number(coupon.discountValue)) / 100
      : Math.min(Number(coupon.discountValue), amount)
    return { valid: true, discount: Math.round(discount * 100) / 100, finalAmount: amount - discount, coupon }
  }

  async seedPlans() {
    const plans = [
      {
        name: 'Gold Monthly',
        description: 'Extra savings every month',
        price: 299,
        durationDays: 30,
        discountPct: 10,
        features: [
          'Extra 10% off all medicines',
          '20% off lab tests',
          'Free home sample collection',
          'Priority doctor booking',
          'Free delivery on all orders',
          'Exclusive Gold member coupons',
        ],
      },
      {
        name: 'Gold Yearly',
        description: 'Best value — save 2 months free',
        price: 2499,
        durationDays: 365,
        discountPct: 10,
        features: [
          'Extra 10% off all medicines',
          '20% off lab tests',
          'Free home sample collection',
          'Priority doctor booking',
          'Free delivery on all orders',
          'Exclusive Gold member coupons',
          '2 months free vs monthly plan',
        ],
      },
      {
        name: 'Gold Family',
        description: 'Cover up to 5 family members',
        price: 499,
        durationDays: 30,
        discountPct: 10,
        features: [
          'Extra 10% off all medicines',
          '20% off lab tests',
          'Cover up to 5 family members',
          'Free home sample collection',
          'Priority doctor booking',
          'Free delivery on all orders',
          'Family health reports',
          'Exclusive Gold member coupons',
        ],
      },
    ]
    for (const p of plans) {
      await this.prisma.membershipPlan.upsert({ where: { id: p.name }, update: {}, create: { ...p, id: undefined } }).catch(() => {})
    }
    const coupons = [
      { code: 'FIRST10', description: 'Get 10% off on your first medicine order', discountType: 'percentage', discountValue: 10, minAmount: 300, maxUses: 1000 },
      { code: 'LAB50', description: '50% off on all lab tests', discountType: 'percentage', discountValue: 50, minAmount: 199, maxUses: 500 },
      { code: 'CONSULT', description: '₹100 off on your first consultation', discountType: 'fixed', discountValue: 100, maxUses: 200 },
      { code: 'SAVE200', description: 'Flat ₹200 off on orders above ₹999', discountType: 'fixed', discountValue: 200, minAmount: 999 },
    ]
    for (const c of coupons) {
      await this.prisma.coupon.upsert({ where: { code: c.code }, update: {}, create: c }).catch(() => {})
    }
    return { plans: plans.length, coupons: coupons.length }
  }
}
