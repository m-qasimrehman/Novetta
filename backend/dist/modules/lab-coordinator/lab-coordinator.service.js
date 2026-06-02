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
exports.LabCoordinatorService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../lib/prisma.service");
let LabCoordinatorService = class LabCoordinatorService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async assertCoordinator(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.role !== 'lab_coordinator') {
            throw new common_1.ForbiddenException('Lab coordinator access required');
        }
        return user;
    }
    async getCenter(userId) {
        return this.prisma.labCenter.findFirst({ where: { ownerId: userId } });
    }
    // ── Center ────────────────────────────────────────────────────────────────
    async getMyCenter(userId) {
        await this.assertCoordinator(userId);
        const center = await this.getCenter(userId);
        return { success: true, data: center };
    }
    async upsertCenter(userId, data) {
        await this.assertCoordinator(userId);
        const existing = await this.getCenter(userId);
        if (existing) {
            const updated = await this.prisma.labCenter.update({ where: { id: existing.id }, data });
            return { success: true, data: updated };
        }
        const created = await this.prisma.labCenter.create({ data: { ...data, ownerId: userId } });
        return { success: true, data: created };
    }
    // ── Stats ─────────────────────────────────────────────────────────────────
    async getStats(userId) {
        await this.assertCoordinator(userId);
        const center = await this.getCenter(userId);
        const where = center ? { labCenterId: center.id } : {};
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const [total, todayCount, pending, homeCollection, reportReady, processing] = await Promise.all([
            this.prisma.labBooking.count({ where }),
            this.prisma.labBooking.count({ where: { ...where, scheduledAt: { gte: today, lt: tomorrow } } }),
            this.prisma.labBooking.count({ where: { ...where, status: { in: ['scheduled', 'confirmed'] } } }),
            this.prisma.labBooking.count({ where: { ...where, collectionType: 'home' } }),
            this.prisma.labBooking.count({ where: { ...where, status: 'report_ready' } }),
            this.prisma.labBooking.count({ where: { ...where, status: 'processing' } }),
        ]);
        return { success: true, data: { total, todayCount, pending, homeCollection, reportReady, processing } };
    }
    // ── Tests ─────────────────────────────────────────────────────────────────
    async getTests(userId, q) {
        await this.assertCoordinator(userId);
        const center = await this.getCenter(userId);
        return this.prisma.labTest.findMany({
            where: {
                ...(center ? { labCenterId: center.id } : {}),
                ...(q ? { name: { contains: q, mode: 'insensitive' } } : {}),
            },
            orderBy: { name: 'asc' },
        });
    }
    async createTest(userId, data) {
        await this.assertCoordinator(userId);
        const center = await this.getCenter(userId);
        const test = await this.prisma.labTest.create({
            data: { ...data, labCenterId: center?.id ?? null },
        });
        return { success: true, data: test };
    }
    async updateTest(userId, testId, data) {
        await this.assertCoordinator(userId);
        const center = await this.getCenter(userId);
        const test = await this.prisma.labTest.findFirst({
            where: { id: testId, ...(center ? { labCenterId: center.id } : {}) },
        });
        if (!test)
            throw new common_1.NotFoundException('Test not found');
        const updated = await this.prisma.labTest.update({ where: { id: testId }, data });
        return { success: true, data: updated };
    }
    async deleteTest(userId, testId) {
        await this.assertCoordinator(userId);
        const center = await this.getCenter(userId);
        const test = await this.prisma.labTest.findFirst({
            where: { id: testId, ...(center ? { labCenterId: center.id } : {}) },
        });
        if (!test)
            throw new common_1.NotFoundException('Test not found');
        await this.prisma.labTest.update({ where: { id: testId }, data: { isActive: false } });
        return { success: true, message: 'Test deactivated' };
    }
    // ── Packages ──────────────────────────────────────────────────────────────
    async getPackages(userId) {
        await this.assertCoordinator(userId);
        const center = await this.getCenter(userId);
        return this.prisma.labPackage.findMany({
            where: center ? { labCenterId: center.id } : {},
            include: { items: { include: { test: true } } },
            orderBy: { name: 'asc' },
        });
    }
    async createPackage(userId, data) {
        await this.assertCoordinator(userId);
        const center = await this.getCenter(userId);
        const pkg = await this.prisma.labPackage.create({
            data: {
                name: data.name,
                description: data.description,
                price: data.price,
                discountPct: data.discountPct ?? 0,
                labCenterId: center?.id ?? null,
                items: { create: data.testIds.map(testId => ({ testId })) },
            },
            include: { items: { include: { test: true } } },
        });
        return { success: true, data: pkg };
    }
    async updatePackage(userId, packageId, data) {
        await this.assertCoordinator(userId);
        const center = await this.getCenter(userId);
        const pkg = await this.prisma.labPackage.findFirst({
            where: { id: packageId, ...(center ? { labCenterId: center.id } : {}) },
        });
        if (!pkg)
            throw new common_1.NotFoundException('Package not found');
        const { testIds, ...rest } = data;
        if (testIds) {
            await this.prisma.labPackageTest.deleteMany({ where: { packageId } });
            await this.prisma.labPackageTest.createMany({
                data: testIds.map(testId => ({ packageId, testId })),
            });
        }
        const updated = await this.prisma.labPackage.update({
            where: { id: packageId },
            data: rest,
            include: { items: { include: { test: true } } },
        });
        return { success: true, data: updated };
    }
    async deletePackage(userId, packageId) {
        await this.assertCoordinator(userId);
        const center = await this.getCenter(userId);
        const pkg = await this.prisma.labPackage.findFirst({
            where: { id: packageId, ...(center ? { labCenterId: center.id } : {}) },
        });
        if (!pkg)
            throw new common_1.NotFoundException('Package not found');
        await this.prisma.labPackage.update({ where: { id: packageId }, data: { isActive: false } });
        return { success: true, message: 'Package deactivated' };
    }
    // ── Bookings ──────────────────────────────────────────────────────────────
    async getBookings(userId, filters) {
        await this.assertCoordinator(userId);
        const center = await this.getCenter(userId);
        const { status, collectionType, date, page = 1, limit = 20 } = filters;
        const skip = (page - 1) * limit;
        const where = {
            ...(center ? { labCenterId: center.id } : {}),
            ...(status ? { status } : {}),
            ...(collectionType ? { collectionType } : {}),
            ...(date
                ? {
                    scheduledAt: {
                        gte: new Date(`${date}T00:00:00`),
                        lte: new Date(`${date}T23:59:59`),
                    },
                }
                : {}),
        };
        const [bookings, total] = await Promise.all([
            this.prisma.labBooking.findMany({
                where,
                skip,
                take: limit,
                orderBy: { scheduledAt: 'asc' },
                include: {
                    patient: { select: { id: true, name: true, phone: true, email: true } },
                    test: true,
                    package: { include: { items: { include: { test: true } } } },
                },
            }),
            this.prisma.labBooking.count({ where }),
        ]);
        return { success: true, data: bookings, total, pages: Math.ceil(total / limit) };
    }
    async updateBookingStatus(userId, bookingId, status) {
        await this.assertCoordinator(userId);
        const center = await this.getCenter(userId);
        const booking = await this.prisma.labBooking.findFirst({
            where: { id: bookingId, ...(center ? { labCenterId: center.id } : {}) },
        });
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        const updated = await this.prisma.labBooking.update({ where: { id: bookingId }, data: { status } });
        return { success: true, data: updated };
    }
    async assignPhlebotomist(userId, bookingId, name, phone) {
        await this.assertCoordinator(userId);
        const center = await this.getCenter(userId);
        const booking = await this.prisma.labBooking.findFirst({
            where: { id: bookingId, ...(center ? { labCenterId: center.id } : {}) },
        });
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        const updated = await this.prisma.labBooking.update({
            where: { id: bookingId },
            data: { phlebotomistName: name, phlebotomistPhone: phone, status: 'confirmed' },
            include: { patient: { select: { id: true, name: true, phone: true } } },
        });
        return { success: true, data: updated };
    }
    async uploadReport(userId, bookingId, reportUrl, reportNote) {
        await this.assertCoordinator(userId);
        const center = await this.getCenter(userId);
        const booking = await this.prisma.labBooking.findFirst({
            where: { id: bookingId, ...(center ? { labCenterId: center.id } : {}) },
        });
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        const updated = await this.prisma.labBooking.update({
            where: { id: bookingId },
            data: {
                reportUrl,
                reportNote: reportNote ?? null,
                reportUploadedAt: new Date(),
                patientNotified: true,
                status: 'report_ready',
            },
        });
        await this.prisma.notification.create({
            data: {
                userId: booking.patientId,
                title: 'Lab Report Ready',
                body: 'Your lab test report is now available for download.',
                type: 'lab_report',
                link: '/labs/my-bookings',
            },
        });
        return { success: true, data: updated };
    }
};
exports.LabCoordinatorService = LabCoordinatorService;
exports.LabCoordinatorService = LabCoordinatorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LabCoordinatorService);
