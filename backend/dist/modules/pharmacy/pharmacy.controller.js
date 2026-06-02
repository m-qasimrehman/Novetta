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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PharmacyController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const pharmacy_service_1 = require("./pharmacy.service");
const jwt_auth_guard_1 = require("../auth/strategies/jwt-auth.guard");
let PharmacyController = class PharmacyController {
    pharmacyService;
    constructor(pharmacyService) {
        this.pharmacyService = pharmacyService;
    }
    searchMedicines(q, category, page, limit) {
        return this.pharmacyService.searchMedicines({
            q, category,
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 20,
        });
    }
    getCategories() {
        return this.pharmacyService.getCategories();
    }
    findMedicine(id) {
        return this.pharmacyService.findMedicineById(id);
    }
    lookupBarcode(code) {
        return this.pharmacyService.lookupBarcode(code);
    }
    comparePrices(medicineId) {
        return this.pharmacyService.comparePrices(medicineId);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    scanPrescription(file) {
        return this.pharmacyService.scanPrescription(file?.originalname);
    }
    pharmacistConsult(body) {
        if (!body.symptoms || !body.symptoms.length) {
            return this.pharmacyService.pharmacistConsult(['general']);
        }
        return this.pharmacyService.pharmacistConsult(body.symptoms);
    }
    createOrder(body, req) {
        return this.pharmacyService.createOrder(req.user.sub, body);
    }
    listOrders(req) {
        return this.pharmacyService.listOrders(req.user.sub);
    }
    getOrderTracking(id, req) {
        return this.pharmacyService.getOrderTracking(id, req.user.sub);
    }
    getOrder(id, req) {
        return this.pharmacyService.getOrder(id, req.user.sub);
    }
    // ── Pharmacies ────────────────────────────────────────────────────────────────
    listPharmacies(city) {
        return this.pharmacyService.listPharmacies(city);
    }
    getPharmacyInventory(pharmacyId, q) {
        return this.pharmacyService.getPharmacyInventory(pharmacyId, q);
    }
    // ── Patient Tele-Pharmacist Session ───────────────────────────────────────────
    createConsultSession(body, req) {
        return this.pharmacyService.createConsultSession(req.user.sub, body.symptoms, body.pharmacyId);
    }
    getMyConsultSession(req) {
        return this.pharmacyService.getMyConsultSessions(req.user.sub);
    }
    cancelOrder(id, req) {
        return this.pharmacyService.cancelOrder(id, req.user.sub);
    }
    generateDeliveryOtp(id, req) {
        return this.pharmacyService.generateDeliveryOtp(id, req.user.sub);
    }
    confirmDelivery(id, body, req) {
        return this.pharmacyService.confirmDeliveryOtp(id, req.user.sub, body.otp);
    }
    getPatientChat(pharmacistId, req) {
        return this.pharmacyService.getPatientChatMessages(req.user.sub, pharmacistId);
    }
    sendPatientMessage(body, req) {
        return this.pharmacyService.sendPatientMessage(req.user.sub, body.receiverId, body.message);
    }
    cancelConsultSession(id, req) {
        return this.pharmacyService.cancelConsultSession(req.user.sub, id);
    }
};
exports.PharmacyController = PharmacyController;
__decorate([
    (0, common_1.Get)('medicines'),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('category')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], PharmacyController.prototype, "searchMedicines", null);
__decorate([
    (0, common_1.Get)('medicines/categories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PharmacyController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Get)('medicines/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PharmacyController.prototype, "findMedicine", null);
__decorate([
    (0, common_1.Get)('barcode/:code'),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PharmacyController.prototype, "lookupBarcode", null);
__decorate([
    (0, common_1.Get)('compare/:medicineId'),
    __param(0, (0, common_1.Param)('medicineId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PharmacyController.prototype, "comparePrices", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('ocr-scan'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('prescription'))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ,
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PharmacyController.prototype, "scanPrescription", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('pharmacist-consult'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PharmacyController.prototype, "pharmacistConsult", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('orders'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PharmacyController.prototype, "createOrder", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('orders'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PharmacyController.prototype, "listOrders", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('orders/:id/tracking'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PharmacyController.prototype, "getOrderTracking", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('orders/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PharmacyController.prototype, "getOrder", null);
__decorate([
    (0, common_1.Get)('pharmacies'),
    __param(0, (0, common_1.Query)('city')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PharmacyController.prototype, "listPharmacies", null);
__decorate([
    (0, common_1.Get)('pharmacies/:id/inventory'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PharmacyController.prototype, "getPharmacyInventory", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('consult-sessions'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PharmacyController.prototype, "createConsultSession", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('consult-sessions/my'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PharmacyController.prototype, "getMyConsultSession", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)('orders/:id/cancel'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PharmacyController.prototype, "cancelOrder", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('orders/:id/delivery-otp'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PharmacyController.prototype, "generateDeliveryOtp", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)('orders/:id/confirm-delivery'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PharmacyController.prototype, "confirmDelivery", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('chat/:pharmacistId'),
    __param(0, (0, common_1.Param)('pharmacistId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PharmacyController.prototype, "getPatientChat", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('chat'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PharmacyController.prototype, "sendPatientMessage", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)('consult-sessions/:id/cancel'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PharmacyController.prototype, "cancelConsultSession", null);
exports.PharmacyController = PharmacyController = __decorate([
    (0, common_1.Controller)('pharmacy'),
    __metadata("design:paramtypes", [pharmacy_service_1.PharmacyService])
], PharmacyController);
