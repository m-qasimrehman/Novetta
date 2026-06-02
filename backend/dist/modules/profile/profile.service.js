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
exports.ProfileService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../lib/prisma.service");
let ProfileService = class ProfileService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getFullProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                medicalHistory: { orderBy: { createdAt: 'desc' } },
                dependents: { orderBy: { createdAt: 'desc' } },
                medicalRecords: { orderBy: { createdAt: 'desc' }, take: 5 },
            },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const { passwordHash: _, ...safe } = user;
        return { success: true, data: safe };
    }
    async updateProfile(userId, data) {
        const updated = await this.prisma.user.update({
            where: { id: userId },
            data,
            select: { id: true, name: true, email: true, phone: true, role: true, isVerified: true, createdAt: true },
        });
        return { success: true, data: updated };
    }
    // Medical History
    async addMedicalHistory(userId, data) {
        const entry = await this.prisma.medicalHistory.create({
            data: {
                patientId: userId,
                condition: data.condition,
                diagnosedAt: data.diagnosedAt ? new Date(data.diagnosedAt) : undefined,
                notes: data.notes,
            },
        });
        return { success: true, data: entry };
    }
    async listMedicalHistory(userId) {
        const history = await this.prisma.medicalHistory.findMany({
            where: { patientId: userId },
            orderBy: { createdAt: 'desc' },
        });
        return { success: true, data: history };
    }
    async deleteMedicalHistory(id, userId) {
        const entry = await this.prisma.medicalHistory.findUnique({ where: { id } });
        if (!entry)
            throw new common_1.NotFoundException('Entry not found');
        if (entry.patientId !== userId)
            throw new common_1.ForbiddenException('Access denied');
        await this.prisma.medicalHistory.delete({ where: { id } });
        return { success: true, message: 'Entry deleted' };
    }
    // Dependents
    async addDependent(userId, data) {
        const dependent = await this.prisma.dependent.create({
            data: {
                userId,
                name: data.name,
                relationship: data.relationship,
                dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
                gender: data.gender,
                bloodGroup: data.bloodGroup,
            },
        });
        return { success: true, data: dependent };
    }
    async listDependents(userId) {
        const dependents = await this.prisma.dependent.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        return { success: true, data: dependents };
    }
    async deleteDependent(id, userId) {
        const dep = await this.prisma.dependent.findUnique({ where: { id } });
        if (!dep)
            throw new common_1.NotFoundException('Dependent not found');
        if (dep.userId !== userId)
            throw new common_1.ForbiddenException('Access denied');
        await this.prisma.dependent.delete({ where: { id } });
        return { success: true, message: 'Dependent removed' };
    }
    // Saved Addresses
    async listAddresses(userId) {
        const addresses = await this.prisma.savedAddress.findMany({
            where: { userId },
            orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        });
        return { success: true, data: addresses };
    }
    async addAddress(userId, data) {
        if (data.isDefault) {
            await this.prisma.savedAddress.updateMany({ where: { userId }, data: { isDefault: false } });
        }
        const addr = await this.prisma.savedAddress.create({
            data: { userId, label: data.label, address: data.address, city: data.city, isDefault: data.isDefault ?? false },
        });
        return { success: true, data: addr };
    }
    async setDefaultAddress(id, userId) {
        const addr = await this.prisma.savedAddress.findUnique({ where: { id } });
        if (!addr || addr.userId !== userId)
            throw new common_1.NotFoundException('Address not found');
        await this.prisma.savedAddress.updateMany({ where: { userId }, data: { isDefault: false } });
        await this.prisma.savedAddress.update({ where: { id }, data: { isDefault: true } });
        return { success: true, message: 'Default address updated' };
    }
    async deleteAddress(id, userId) {
        const addr = await this.prisma.savedAddress.findUnique({ where: { id } });
        if (!addr || addr.userId !== userId)
            throw new common_1.NotFoundException('Address not found');
        await this.prisma.savedAddress.delete({ where: { id } });
        return { success: true, message: 'Address removed' };
    }
};
exports.ProfileService = ProfileService;
exports.ProfileService = ProfileService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProfileService);
