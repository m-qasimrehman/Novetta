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
exports.LabsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../lib/prisma.service");
let LabsService = class LabsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listTests(category, q) {
        return this.prisma.labTest.findMany({
            where: {
                isActive: true,
                ...(category ? { category } : {}),
                ...(q ? { name: { contains: q, mode: 'insensitive' } } : {}),
            },
            include: { labCenter: { select: { id: true, name: true, city: true } } },
            orderBy: { name: 'asc' },
        });
    }
    async getTest(id) {
        const test = await this.prisma.labTest.findUnique({
            where: { id },
            include: { labCenter: true },
        });
        if (!test)
            throw new common_1.NotFoundException('Lab test not found');
        return test;
    }
    async listPackages(labCenterId) {
        return this.prisma.labPackage.findMany({
            where: {
                isActive: true,
                ...(labCenterId ? { labCenterId } : {}),
            },
            include: {
                items: { include: { test: true } },
                labCenter: { select: { id: true, name: true, city: true } },
            },
            orderBy: { name: 'asc' },
        });
    }
    async listCenters(city) {
        return this.prisma.labCenter.findMany({
            where: {
                isActive: true,
                ...(city ? { city: { contains: city, mode: 'insensitive' } } : {}),
            },
            orderBy: { name: 'asc' },
        });
    }
    async bookTest(patientId, dto) {
        let amount = 0;
        if (dto.testId) {
            const test = await this.prisma.labTest.findUnique({ where: { id: dto.testId } });
            if (!test)
                throw new common_1.NotFoundException('Lab test not found');
            amount = Number(test.price) * (1 - test.discountPct / 100);
        }
        else if (dto.packageId) {
            const pkg = await this.prisma.labPackage.findUnique({ where: { id: dto.packageId } });
            if (!pkg)
                throw new common_1.NotFoundException('Lab package not found');
            amount = Number(pkg.price) * (1 - pkg.discountPct / 100);
        }
        return this.prisma.labBooking.create({
            data: {
                patientId,
                testId: dto.testId,
                packageId: dto.packageId,
                labCenterId: dto.labCenterId,
                collectionType: dto.collectionType,
                scheduledAt: new Date(dto.scheduledAt),
                address: dto.address,
                notes: dto.notes,
                amount,
                status: 'scheduled',
            },
            include: {
                test: true,
                package: { include: { items: { include: { test: true } } } },
                labCenter: { select: { id: true, name: true, address: true } },
            },
        });
    }
    async myBookings(patientId) {
        return this.prisma.labBooking.findMany({
            where: { patientId },
            include: {
                test: true,
                package: { include: { items: { include: { test: true } } } },
                labCenter: { select: { id: true, name: true, address: true, phone: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async cancelBooking(id, patientId) {
        const booking = await this.prisma.labBooking.findFirst({ where: { id, patientId } });
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        return this.prisma.labBooking.update({ where: { id }, data: { status: 'cancelled' } });
    }
    async seedTests() {
        const tests = [
            { name: 'Complete Blood Count (CBC)', category: 'Hematology', price: 299, discountPct: 50, turnaround: '24 hours', description: 'Comprehensive blood cell analysis including RBC, WBC, platelets.', sampleType: 'Blood', requiresFasting: false },
            { name: 'Thyroid Profile (T3, T4, TSH)', category: 'Endocrinology', price: 449, discountPct: 50, turnaround: '24 hours', description: 'Full thyroid function panel.', sampleType: 'Blood', requiresFasting: true },
            { name: 'Lipid Profile', category: 'Cardiology', price: 349, discountPct: 50, turnaround: '24 hours', description: 'Cholesterol, triglycerides, HDL, LDL analysis.', sampleType: 'Blood', requiresFasting: true },
            { name: 'Blood Glucose Fasting', category: 'Diabetes', price: 89, discountPct: 50, turnaround: '4 hours', description: 'Fasting blood sugar test.', sampleType: 'Blood', requiresFasting: true },
            { name: 'Liver Function Test (LFT)', category: 'Gastroenterology', price: 399, discountPct: 40, turnaround: '24 hours', description: 'ALT, AST, bilirubin and liver enzyme panel.', sampleType: 'Blood', requiresFasting: false },
            { name: 'Kidney Function Test (KFT)', category: 'Nephrology', price: 349, discountPct: 40, turnaround: '24 hours', description: 'Creatinine, urea, electrolytes panel.', sampleType: 'Blood', requiresFasting: false },
            { name: 'HbA1c (Glycated Haemoglobin)', category: 'Diabetes', price: 299, discountPct: 30, turnaround: '24 hours', description: '3-month average blood sugar control indicator.', sampleType: 'Blood', requiresFasting: false },
            { name: 'Vitamin D (25-OH)', category: 'Nutrition', price: 499, discountPct: 20, turnaround: '48 hours', description: 'Vitamin D deficiency screening.', sampleType: 'Blood', requiresFasting: false },
            { name: 'Vitamin B12', category: 'Nutrition', price: 349, discountPct: 20, turnaround: '24 hours', description: 'B12 level assessment for neurological health.', sampleType: 'Blood', requiresFasting: false },
            { name: 'Urine Routine & Microscopy', category: 'Nephrology', price: 149, discountPct: 30, turnaround: '4 hours', description: 'Full urinalysis including microscopy.', sampleType: 'Urine', requiresFasting: false },
            { name: 'COVID-19 RT-PCR', category: 'Infectious Disease', price: 799, discountPct: 0, turnaround: '12 hours', description: 'Gold standard COVID-19 detection test.', sampleType: 'Nasal Swab', requiresFasting: false },
            { name: 'Dengue NS1 Antigen', category: 'Infectious Disease', price: 599, discountPct: 10, turnaround: '6 hours', description: 'Early dengue fever detection.', sampleType: 'Blood', requiresFasting: false },
        ];
        for (const t of tests) {
            await this.prisma.labTest.upsert({
                where: { id: t.name },
                update: {},
                create: { ...t, id: undefined },
            }).catch(() => { });
        }
        return { seeded: tests.length };
    }
};
exports.LabsService = LabsService;
exports.LabsService = LabsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LabsService);
