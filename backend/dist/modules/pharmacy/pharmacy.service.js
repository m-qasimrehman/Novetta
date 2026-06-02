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
exports.PharmacyService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../lib/prisma.service");
const MOCK_PHARMACIES = [
    { id: 'ph1', name: 'MediPlus Pharmacy', distance: '0.8 km', rating: 4.8, deliveryTime: '30 min' },
    { id: 'ph2', name: 'HealthCare Plus', distance: '1.2 km', rating: 4.5, deliveryTime: '45 min' },
    { id: 'ph3', name: 'City Medicals', distance: '2.1 km', rating: 4.3, deliveryTime: '60 min' },
    { id: 'ph4', name: 'Apollo Pharmacy', distance: '2.9 km', rating: 4.7, deliveryTime: '40 min' },
];
const OTC_RECOMMENDATIONS = {
    headache: ['Paracetamol', 'Ibuprofen', 'Aspirin'],
    fever: ['Paracetamol', 'Ibuprofen'],
    cold: ['Cetirizine', 'Paracetamol', 'Vitamin C'],
    cough: ['Dextromethorphan', 'Guaifenesin'],
    acidity: ['Omeprazole', 'Ranitidine', 'Antacid'],
    allergy: ['Cetirizine', 'Loratadine', 'Fexofenadine'],
    pain: ['Ibuprofen', 'Paracetamol', 'Diclofenac'],
    stomach: ['Omeprazole', 'Metoclopramide', 'Domperidone'],
    diarrhea: ['ORS', 'Loperamide', 'Metronidazole'],
    constipation: ['Lactulose', 'Bisacodyl', 'Psyllium husk'],
    skin: ['Clotrimazole', 'Hydrocortisone', 'Calamine lotion'],
    eye: ['Sodium Cromoglycate', 'Ketotifen eye drops'],
    vitamin: ['Vitamin C', 'Vitamin D3', 'Vitamin B12'],
    sleep: ['Melatonin', 'Diphenhydramine'],
};
let PharmacyService = class PharmacyService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async searchMedicines(filters) {
        const { q, category, page = 1, limit = 20 } = filters;
        const skip = (page - 1) * limit;
        const where = {
            AND: [
                q ? {
                    OR: [
                        { name: { contains: q, mode: 'insensitive' } },
                        { genericName: { contains: q, mode: 'insensitive' } },
                        { manufacturer: { contains: q, mode: 'insensitive' } },
                    ],
                } : {},
                category ? { category: { contains: category, mode: 'insensitive' } } : {},
            ],
        };
        const [medicines, total] = await Promise.all([
            this.prisma.medicine.findMany({ where, skip, take: limit, orderBy: { name: 'asc' } }),
            this.prisma.medicine.count({ where }),
        ]);
        return { success: true, data: medicines, pagination: { total, page, limit, pages: Math.ceil(total / limit) } };
    }
    async findMedicineById(id) {
        const medicine = await this.prisma.medicine.findUnique({ where: { id } });
        if (!medicine)
            throw new common_1.NotFoundException('Medicine not found');
        return { success: true, data: medicine };
    }
    async getCategories() {
        const result = await this.prisma.medicine.findMany({
            where: { category: { not: null } },
            select: { category: true },
            distinct: ['category'],
        });
        return result.map(m => m.category).filter(Boolean);
    }
    async scanPrescription(_fileName) {
        // Simulate OCR: return a random subset of in-stock medicines as extracted results
        const allMeds = await this.prisma.medicine.findMany({
            where: { inStock: true },
            take: 50,
            orderBy: { name: 'asc' },
        });
        const count = Math.min(allMeds.length, 3 + Math.floor(Math.random() * 4)); // 3-6 medicines
        const shuffled = allMeds.sort(() => Math.random() - 0.5).slice(0, count);
        const extracted = shuffled.map(m => ({
            id: m.id,
            name: m.name,
            genericName: m.genericName,
            confidence: Math.round(85 + Math.random() * 14), // 85-99% confidence
            dosage: ['500mg', '250mg', '10mg', '20mg', '5mg'][Math.floor(Math.random() * 5)],
            frequency: ['Once daily', 'Twice daily', 'Three times daily'][Math.floor(Math.random() * 3)],
            duration: ['5 days', '7 days', '10 days', '14 days'][Math.floor(Math.random() * 4)],
            price: m.price,
            inStock: m.inStock,
        }));
        return {
            success: true,
            message: `Successfully extracted ${extracted.length} medicines from prescription`,
            medicines: extracted,
        };
    }
    async lookupBarcode(barcode) {
        const medicine = await this.prisma.medicine.findFirst({
            where: { barcode: { equals: barcode, mode: 'insensitive' } },
        });
        if (!medicine)
            throw new common_1.NotFoundException('Medicine not found for this barcode');
        const comparison = this.buildComparison(Number(medicine.price));
        return { success: true, data: { medicine, comparison } };
    }
    async comparePrices(medicineId) {
        const medicine = await this.prisma.medicine.findUnique({ where: { id: medicineId } });
        if (!medicine)
            throw new common_1.NotFoundException('Medicine not found');
        const comparison = this.buildComparison(Number(medicine.price));
        return { success: true, data: { medicine, pharmacies: comparison } };
    }
    buildComparison(basePrice) {
        return MOCK_PHARMACIES.map((ph, i) => {
            const variantPct = [-8, 0, 5, 12][i]; // price variants across pharmacies
            const price = Math.round((basePrice * (1 + variantPct / 100)) * 100) / 100;
            return {
                ...ph,
                price,
                inStock: Math.random() > 0.2, // 80% in stock
                memberDiscount: 10,
                memberPrice: Math.round(price * 0.9 * 100) / 100,
            };
        }).sort((a, b) => a.price - b.price);
    }
    async getOrderTracking(orderId, patientId) {
        const order = await this.prisma.pharmacyOrder.findUnique({
            where: { id: orderId },
            include: { items: { include: { medicine: { select: { id: true, name: true } } } } },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        if (order.patientId !== patientId)
            throw new common_1.NotFoundException('Order not found');
        const created = new Date(order.createdAt);
        const now = new Date();
        const elapsedMin = (now.getTime() - created.getTime()) / 60000;
        const steps = [
            { id: 'placed', label: 'Order Placed', icon: 'check', completedAt: created.toISOString(), done: true },
            { id: 'confirmed', label: 'Order Confirmed', icon: 'store', completedAt: elapsedMin > 5 ? new Date(created.getTime() + 5 * 60000).toISOString() : null, done: elapsedMin > 5 },
            { id: 'preparing', label: 'Preparing Medicines', icon: 'pill', completedAt: elapsedMin > 15 ? new Date(created.getTime() + 15 * 60000).toISOString() : null, done: elapsedMin > 15 },
            { id: 'picked_up', label: 'Picked Up by Rider', icon: 'bike', completedAt: elapsedMin > 25 ? new Date(created.getTime() + 25 * 60000).toISOString() : null, done: elapsedMin > 25 && order.deliveryType === 'delivery' },
            { id: 'delivered', label: 'Delivered', icon: 'home', completedAt: elapsedMin > 45 ? new Date(created.getTime() + 45 * 60000).toISOString() : null, done: order.status === 'delivered' },
        ];
        const currentStep = steps.filter(s => s.done).length;
        const estimatedDelivery = new Date(created.getTime() + 45 * 60000).toISOString();
        return {
            success: true,
            data: {
                order: {
                    id: order.id,
                    status: order.status,
                    deliveryType: order.deliveryType,
                    address: order.address,
                    totalAmount: order.totalAmount,
                    createdAt: order.createdAt,
                    items: order.items,
                },
                tracking: {
                    steps,
                    currentStep,
                    estimatedDelivery,
                    rider: elapsedMin > 25 ? { name: 'Ahmed Khan', phone: '+92-300-1234567', rating: 4.8 } : null,
                },
            },
        };
    }
    async pharmacistConsult(symptoms) {
        const keywordsLower = symptoms.map(s => s.toLowerCase());
        const recommendedNames = new Set();
        for (const kw of keywordsLower) {
            for (const [key, meds] of Object.entries(OTC_RECOMMENDATIONS)) {
                if (kw.includes(key) || key.includes(kw)) {
                    meds.forEach(m => recommendedNames.add(m));
                }
            }
        }
        // Fallback if no match
        if (recommendedNames.size === 0) {
            OTC_RECOMMENDATIONS['vitamin'].forEach(m => recommendedNames.add(m));
        }
        const medicines = await this.prisma.medicine.findMany({
            where: {
                OR: [...recommendedNames].map(name => ({
                    name: { contains: name, mode: 'insensitive' },
                })),
                inStock: true,
            },
            take: 6,
        });
        const advice = {
            headache: 'Take plenty of rest, stay hydrated. Avoid screens. Consult a doctor if pain persists > 2 days.',
            fever: 'Stay hydrated, rest, use cool compresses. Seek medical help if temperature exceeds 39°C.',
            cold: 'Rest, drink warm fluids, use steam inhalation. Symptoms usually resolve within 7-10 days.',
            cough: 'Stay hydrated, avoid irritants. See a doctor if cough persists > 2 weeks or you cough blood.',
            acidity: 'Eat smaller meals, avoid spicy/acidic foods. Elevate head while sleeping.',
            pain: 'Apply ice/heat, rest the affected area. Seek care if pain is severe or unrelenting.',
            default: 'Maintain good hygiene, stay hydrated, and rest adequately. Consult a physician if symptoms worsen.',
        };
        const matchedAdvice = keywordsLower.find(k => advice[k]);
        const generalAdvice = advice[matchedAdvice ?? 'default'];
        return {
            success: true,
            data: {
                symptoms,
                advice: generalAdvice,
                disclaimer: 'This is general OTC guidance only. Always consult a licensed pharmacist or doctor for proper diagnosis and treatment.',
                recommendations: medicines,
            },
        };
    }
    async createOrder(patientId, data) {
        const medicineIds = data.items.map(i => i.medicineId);
        const medicines = await this.prisma.medicine.findMany({ where: { id: { in: medicineIds } } });
        const medicineMap = new Map(medicines.map(m => [m.id, m]));
        let totalAmount = 0;
        const itemsData = data.items.map(item => {
            const med = medicineMap.get(item.medicineId);
            if (!med)
                throw new common_1.NotFoundException(`Medicine ${item.medicineId} not found`);
            const price = Number(med.price);
            totalAmount += price * item.quantity;
            return { medicineId: item.medicineId, quantity: item.quantity, price: med.price };
        });
        const order = await this.prisma.pharmacyOrder.create({
            data: {
                patientId,
                deliveryType: data.deliveryType,
                address: data.address,
                prescriptionId: data.prescriptionId,
                notes: data.notes,
                totalAmount,
                items: { create: itemsData },
            },
            include: {
                items: { include: { medicine: true } },
            },
        });
        if (data.couponCode) {
            await this.prisma.coupon.updateMany({
                where: { code: data.couponCode.toUpperCase(), isActive: true },
                data: { usedCount: { increment: 1 } },
            }).catch(() => { });
        }
        return { success: true, message: 'Order placed successfully', data: order };
    }
    async listOrders(patientId) {
        const orders = await this.prisma.pharmacyOrder.findMany({
            where: { patientId },
            orderBy: { createdAt: 'desc' },
            include: {
                items: { include: { medicine: { select: { id: true, name: true, imageUrl: true } } } },
                prescription: { select: { id: true, createdAt: true } },
            },
        });
        return { success: true, data: orders };
    }
    async getOrder(id, patientId) {
        const order = await this.prisma.pharmacyOrder.findUnique({
            where: { id },
            include: {
                items: { include: { medicine: true } },
                prescription: { include: { items: true } },
            },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        if (order.patientId !== patientId)
            throw new common_1.NotFoundException('Order not found');
        return { success: true, data: order };
    }
    deliveryOtps = new Map();
    async generateDeliveryOtp(orderId, patientId) {
        const order = await this.prisma.pharmacyOrder.findUnique({ where: { id: orderId } });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        if (order.patientId !== patientId)
            throw new common_1.NotFoundException('Order not found');
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        this.deliveryOtps.set(orderId, otp);
        return { success: true, data: { otp } };
    }
    async confirmDeliveryOtp(orderId, patientId, otp) {
        const order = await this.prisma.pharmacyOrder.findUnique({ where: { id: orderId } });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        if (order.patientId !== patientId)
            throw new common_1.NotFoundException('Order not found');
        const stored = this.deliveryOtps.get(orderId);
        if (!stored || stored !== otp)
            throw new common_1.BadRequestException('Invalid OTP');
        this.deliveryOtps.delete(orderId);
        const updated = await this.prisma.pharmacyOrder.update({ where: { id: orderId }, data: { status: 'delivered' } });
        return { success: true, data: updated };
    }
    async cancelOrder(id, patientId) {
        const order = await this.prisma.pharmacyOrder.findUnique({ where: { id } });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        if (order.patientId !== patientId)
            throw new common_1.NotFoundException('Order not found');
        const updated = await this.prisma.pharmacyOrder.update({ where: { id }, data: { status: 'cancelled' } });
        return { success: true, data: updated };
    }
    // ── Pharmacies ────────────────────────────────────────────────────────────────
    async listPharmacies(city) {
        const pharmacies = await this.prisma.pharmacy.findMany({
            where: { isActive: true, ...(city ? { city: { contains: city, mode: 'insensitive' } } : {}) },
            orderBy: { name: 'asc' },
        });
        return { success: true, data: pharmacies };
    }
    async getPharmacyInventory(pharmacyId, q) {
        const items = await this.prisma.pharmacyInventory.findMany({
            where: {
                pharmacyId,
                isAvailable: true,
                ...(q ? { medicine: { name: { contains: q, mode: 'insensitive' } } } : {}),
            },
            include: {
                medicine: {
                    select: {
                        id: true, name: true, genericName: true, category: true,
                        imageUrl: true, prescriptionRequired: true, description: true,
                    },
                },
            },
            orderBy: { medicine: { name: 'asc' } },
        });
        return {
            success: true,
            data: items.map(i => ({
                ...i,
                stockStatus: i.stock === 0 ? 'out_of_stock' : i.stock <= i.lowThreshold ? 'low_stock' : 'in_stock',
            })),
        };
    }
    // ── Patient Tele-Pharmacist Sessions ──────────────────────────────────────────
    async createConsultSession(patientId, symptoms, pharmacyId) {
        const session = await this.prisma.pharmacistSession.create({
            data: { patientId, symptoms, pharmacyId, status: 'waiting' },
            include: { patient: { select: { id: true, name: true } } },
        });
        return { success: true, data: session };
    }
    async getMyConsultSessions(patientId) {
        const sessions = await this.prisma.pharmacistSession.findMany({
            where: { patientId },
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: { pharmacist: { select: { id: true, name: true } } },
        });
        return { success: true, data: sessions };
    }
    async getPatientChatMessages(patientId, pharmacistId) {
        const messages = await this.prisma.message.findMany({
            where: {
                OR: [
                    { senderId: patientId, receiverId: pharmacistId },
                    { senderId: pharmacistId, receiverId: patientId },
                ],
            },
            orderBy: { createdAt: 'asc' },
            include: { sender: { select: { id: true, name: true } } },
        });
        return { success: true, data: messages };
    }
    async sendPatientMessage(patientId, receiverId, message) {
        const msg = await this.prisma.message.create({
            data: { senderId: patientId, receiverId, message },
            include: { sender: { select: { id: true, name: true } } },
        });
        return { success: true, data: msg };
    }
    async cancelConsultSession(patientId, sessionId) {
        const session = await this.prisma.pharmacistSession.findUnique({ where: { id: sessionId } });
        if (!session || session.patientId !== patientId)
            throw new Error('Session not found');
        const updated = await this.prisma.pharmacistSession.update({
            where: { id: sessionId },
            data: { status: 'cancelled' },
        });
        return { success: true, data: updated };
    }
};
exports.PharmacyService = PharmacyService;
exports.PharmacyService = PharmacyService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PharmacyService);
