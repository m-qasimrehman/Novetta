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
exports.MembershipService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../lib/prisma.service");
let MembershipService = class MembershipService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listPlans() {
        return this.prisma.membershipPlan.findMany({ where: { isActive: true }, orderBy: { price: 'asc' } });
    }
    async subscribe(userId, planId) {
        const plan = await this.prisma.membershipPlan.findUnique({ where: { id: planId } });
        if (!plan)
            throw new common_1.NotFoundException('Plan not found');
        const active = await this.prisma.userMembership.findFirst({ where: { userId, status: 'active', expiresAt: { gt: new Date() } } });
        if (active)
            throw new common_1.BadRequestException('You already have an active membership');
        const expiresAt = new Date(Date.now() + plan.durationDays * 24 * 3600 * 1000);
        return this.prisma.userMembership.create({ data: { userId, planId, status: 'active', expiresAt }, include: { plan: true } });
    }
    async myMembership(userId) {
        return this.prisma.userMembership.findFirst({
            where: { userId, status: 'active', expiresAt: { gt: new Date() } },
            include: { plan: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async listCoupons() {
        return this.prisma.coupon.findMany({
            where: { isActive: true, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
        });
    }
    async applyCoupon(code, amount) {
        const coupon = await this.prisma.coupon.findFirst({
            where: { code: code.toUpperCase(), isActive: true, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
        });
        if (!coupon)
            throw new common_1.NotFoundException('Invalid or expired coupon code');
        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses)
            throw new common_1.BadRequestException('Coupon usage limit reached');
        if (coupon.minAmount && amount < Number(coupon.minAmount)) {
            throw new common_1.BadRequestException(`Minimum order amount for this coupon is ₹${coupon.minAmount}`);
        }
        const discount = coupon.discountType === 'percentage'
            ? (amount * Number(coupon.discountValue)) / 100
            : Math.min(Number(coupon.discountValue), amount);
        return { valid: true, discount: Math.round(discount * 100) / 100, finalAmount: amount - discount, coupon };
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
        ];
        for (const p of plans) {
            await this.prisma.membershipPlan.upsert({ where: { id: p.name }, update: {}, create: { ...p, id: undefined } }).catch(() => { });
        }
        const coupons = [
            { code: 'FIRST10', description: 'Get 10% off on your first medicine order', discountType: 'percentage', discountValue: 10, minAmount: 300, maxUses: 1000 },
            { code: 'LAB50', description: '50% off on all lab tests', discountType: 'percentage', discountValue: 50, minAmount: 199, maxUses: 500 },
            { code: 'CONSULT', description: '₹100 off on your first consultation', discountType: 'fixed', discountValue: 100, maxUses: 200 },
            { code: 'SAVE200', description: 'Flat ₹200 off on orders above ₹999', discountType: 'fixed', discountValue: 200, minAmount: 999 },
        ];
        for (const c of coupons) {
            await this.prisma.coupon.upsert({ where: { code: c.code }, update: {}, create: c }).catch(() => { });
        }
        return { plans: plans.length, coupons: coupons.length };
    }
};
exports.MembershipService = MembershipService;
exports.MembershipService = MembershipService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MembershipService);
