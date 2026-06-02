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
exports.MedicalRecordsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../lib/prisma.service");
let MedicalRecordsService = class MedicalRecordsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(patientId) {
        const records = await this.prisma.medicalRecord.findMany({
            where: { patientId },
            orderBy: { createdAt: 'desc' },
        });
        return { success: true, data: records };
    }
    async create(patientId, data) {
        const record = await this.prisma.medicalRecord.create({
            data: { patientId, ...data },
        });
        return { success: true, data: record };
    }
    async delete(id, patientId) {
        const record = await this.prisma.medicalRecord.findUnique({ where: { id } });
        if (!record)
            throw new common_1.NotFoundException('Record not found');
        if (record.patientId !== patientId)
            throw new common_1.ForbiddenException('Access denied');
        await this.prisma.medicalRecord.delete({ where: { id } });
        return { success: true, message: 'Record deleted' };
    }
};
exports.MedicalRecordsService = MedicalRecordsService;
exports.MedicalRecordsService = MedicalRecordsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MedicalRecordsService);
