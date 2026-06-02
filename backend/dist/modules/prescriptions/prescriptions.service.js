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
exports.PrescriptionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../lib/prisma.service");
let PrescriptionsService = class PrescriptionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listForPatient(patientId) {
        const prescriptions = await this.prisma.prescription.findMany({
            where: { patientId },
            orderBy: { createdAt: 'desc' },
            include: {
                items: true,
                doctor: { include: { user: { select: { id: true, name: true } } } },
                session: { select: { id: true, createdAt: true, appointmentId: true } },
            },
        });
        return { success: true, data: prescriptions };
    }
    async findOne(id, patientId) {
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
        });
        if (!prescription)
            throw new common_1.NotFoundException('Prescription not found');
        if (prescription.patientId !== patientId)
            throw new common_1.ForbiddenException('Access denied');
        return { success: true, data: prescription };
    }
};
exports.PrescriptionsService = PrescriptionsService;
exports.PrescriptionsService = PrescriptionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrescriptionsService);
