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
exports.PharmacistPanelController = void 0;
const common_1 = require("@nestjs/common");
const pharmacist_panel_service_1 = require("./pharmacist-panel.service");
const jwt_auth_guard_1 = require("../auth/strategies/jwt-auth.guard");
let PharmacistPanelController = class PharmacistPanelController {
    svc;
    constructor(svc) {
        this.svc = svc;
    }
    getMe(req) {
        return this.svc.getMyPharmacy(req.user.sub);
    }
    // ── Queue ─────────────────────────────────────────────────────────────────────
    getQueue(req) {
        return this.svc.getQueue(req.user.sub);
    }
    getActiveSessions(req) {
        return this.svc.getMyActiveSessions(req.user.sub);
    }
    acceptSession(id, req) {
        return this.svc.acceptSession(req.user.sub, id);
    }
    completeSession(id, body, req) {
        return this.svc.completeSession(req.user.sub, id, body.notes);
    }
    // ── Prescription + Digital Signature ─────────────────────────────────────────
    issuePrescription(sessionId, body, req) {
        return this.svc.issuePrescriptionWithSignature(req.user.sub, sessionId, body);
    }
    // ── Chat ─────────────────────────────────────────────────────────────────────
    getMessages(patientId, req) {
        return this.svc.getSessionMessages(req.user.sub, patientId);
    }
    sendMessage(body, req) {
        return this.svc.sendMessage(req.user.sub, body.receiverId, body.message);
    }
    // ── Patient Summary ───────────────────────────────────────────────────────────
    getPatientSummary(patientId, req) {
        return this.svc.getPatientSummary(req.user.sub, patientId);
    }
    // ── Inventory ─────────────────────────────────────────────────────────────────
    getInventory(pharmacyId, req) {
        return this.svc.getInventory(req.user.sub, pharmacyId);
    }
    upsertInventory(pharmacyId, body, req) {
        return this.svc.upsertInventory(req.user.sub, pharmacyId, body.medicineId, body.stock, body.price, body.lowThreshold);
    }
    // ── Orders ────────────────────────────────────────────────────────────────────
    getOrders(req, pharmacyId, status, page) {
        return this.svc.getOrders(req.user.sub, pharmacyId, status, Number(page) || 1);
    }
    updateOrderStatus(id, body, req) {
        return this.svc.updateOrderStatus(req.user.sub, id, body.status);
    }
    validatePrescription(id, body, req) {
        return this.svc.validatePrescription(req.user.sub, id, body.approved, body.note);
    }
};
exports.PharmacistPanelController = PharmacistPanelController;
__decorate([
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PharmacistPanelController.prototype, "getMe", null);
__decorate([
    (0, common_1.Get)('queue'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PharmacistPanelController.prototype, "getQueue", null);
__decorate([
    (0, common_1.Get)('active-sessions'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PharmacistPanelController.prototype, "getActiveSessions", null);
__decorate([
    (0, common_1.Patch)('sessions/:id/accept'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PharmacistPanelController.prototype, "acceptSession", null);
__decorate([
    (0, common_1.Patch)('sessions/:id/complete'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PharmacistPanelController.prototype, "completeSession", null);
__decorate([
    (0, common_1.Post)('sessions/:id/prescribe'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PharmacistPanelController.prototype, "issuePrescription", null);
__decorate([
    (0, common_1.Get)('chat/:patientId'),
    __param(0, (0, common_1.Param)('patientId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PharmacistPanelController.prototype, "getMessages", null);
__decorate([
    (0, common_1.Post)('chat'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PharmacistPanelController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Get)('patients/:id/summary'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PharmacistPanelController.prototype, "getPatientSummary", null);
__decorate([
    (0, common_1.Get)('inventory/:pharmacyId'),
    __param(0, (0, common_1.Param)('pharmacyId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PharmacistPanelController.prototype, "getInventory", null);
__decorate([
    (0, common_1.Post)('inventory/:pharmacyId'),
    __param(0, (0, common_1.Param)('pharmacyId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PharmacistPanelController.prototype, "upsertInventory", null);
__decorate([
    (0, common_1.Get)('orders'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('pharmacyId')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], PharmacistPanelController.prototype, "getOrders", null);
__decorate([
    (0, common_1.Patch)('orders/:id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PharmacistPanelController.prototype, "updateOrderStatus", null);
__decorate([
    (0, common_1.Patch)('orders/:id/validate-prescription'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PharmacistPanelController.prototype, "validatePrescription", null);
exports.PharmacistPanelController = PharmacistPanelController = __decorate([
    (0, common_1.Controller)('pharmacist-panel'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [pharmacist_panel_service_1.PharmacistPanelService])
], PharmacistPanelController);
