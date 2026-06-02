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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const admin_service_1 = require("./admin.service");
const jwt_auth_guard_1 = require("../auth/strategies/jwt-auth.guard");
let AdminController = class AdminController {
    svc;
    constructor(svc) {
        this.svc = svc;
    }
    stats(req, dateFrom, dateTo) {
        return this.svc.stats(req.user?.sub, dateFrom, dateTo);
    }
    revenue(req) {
        return this.svc.revenue(req.user?.sub);
    }
    listUsers(req, page, limit, role, q) {
        return this.svc.listUsers(req.user?.sub, Number(page) || 1, Number(limit) || 20, role, q);
    }
    toggleUser(id, req) {
        return this.svc.toggleUserActive(req.user?.sub, id);
    }
    listDoctors(req) {
        return this.svc.listDoctors(req.user?.sub);
    }
    verifyDoctor(id, req) {
        return this.svc.verifyDoctor(req.user?.sub, id);
    }
    // ── Membership Plans ──────────────────────────────────────────────────────
    listPlans(req) {
        return this.svc.listPlans(req.user?.sub);
    }
    createPlan(body, req) {
        return this.svc.createPlan(req.user?.sub, body);
    }
    updatePlan(id, body, req) {
        return this.svc.updatePlan(req.user?.sub, id, body);
    }
    deletePlan(id, req) {
        return this.svc.deletePlan(req.user?.sub, id);
    }
    membershipStats(req) {
        return this.svc.membershipStats(req.user?.sub);
    }
    // ── Coupons ───────────────────────────────────────────────────────────────
    listCoupons(req) {
        return this.svc.listCoupons(req.user?.sub);
    }
    createCoupon(body, req) {
        return this.svc.createCoupon(req.user?.sub, body);
    }
    updateCoupon(id, body, req) {
        return this.svc.updateCoupon(req.user?.sub, id, body);
    }
    deleteCoupon(id, req) {
        return this.svc.deleteCoupon(req.user?.sub, id);
    }
    // ── Appointments & Orders ─────────────────────────────────────────────────
    listAllAppointments(req, status, page) {
        return this.svc.listAllAppointments(req.user?.sub, status, Number(page) || 1);
    }
    listAllOrders(req, type, page) {
        return this.svc.listAllOrders(req.user?.sub, type || 'pharmacy', Number(page) || 1);
    }
    // ── Payouts ───────────────────────────────────────────────────────────────
    getPayouts(req) {
        return this.svc.getPayouts(req.user?.sub);
    }
    // ── Pharmacies ────────────────────────────────────────────────────────────
    listPharmacies(req) {
        return this.svc.listPharmacies(req.user?.sub);
    }
    togglePharmacy(id, req) {
        return this.svc.togglePharmacyActive(req.user?.sub, id);
    }
    // ── Lab Centers ───────────────────────────────────────────────────────────
    listLabCenters(req) {
        return this.svc.listLabCenters(req.user?.sub);
    }
    toggleLab(id, req) {
        return this.svc.toggleLabActive(req.user?.sub, id);
    }
    // ── System ────────────────────────────────────────────────────────────────
    getOnlineUsers(req) {
        return this.svc.getOnlineUsers(req.user?.sub);
    }
    recentActivity(req) {
        return this.svc.recentActivity(req.user?.sub);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('dateFrom')),
    __param(2, (0, common_1.Query)('dateTo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "stats", null);
__decorate([
    (0, common_1.Get)('revenue'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "revenue", null);
__decorate([
    (0, common_1.Get)('users'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('role')),
    __param(4, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "listUsers", null);
__decorate([
    (0, common_1.Patch)('users/:id/toggle'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "toggleUser", null);
__decorate([
    (0, common_1.Get)('doctors'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "listDoctors", null);
__decorate([
    (0, common_1.Patch)('doctors/:id/verify'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "verifyDoctor", null);
__decorate([
    (0, common_1.Get)('plans'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "listPlans", null);
__decorate([
    (0, common_1.Post)('plans'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createPlan", null);
__decorate([
    (0, common_1.Patch)('plans/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updatePlan", null);
__decorate([
    (0, common_1.Delete)('plans/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "deletePlan", null);
__decorate([
    (0, common_1.Get)('membership-stats'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "membershipStats", null);
__decorate([
    (0, common_1.Get)('coupons'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "listCoupons", null);
__decorate([
    (0, common_1.Post)('coupons'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createCoupon", null);
__decorate([
    (0, common_1.Patch)('coupons/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateCoupon", null);
__decorate([
    (0, common_1.Delete)('coupons/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "deleteCoupon", null);
__decorate([
    (0, common_1.Get)('appointments'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "listAllAppointments", null);
__decorate([
    (0, common_1.Get)('orders'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('type')),
    __param(2, (0, common_1.Query)('page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "listAllOrders", null);
__decorate([
    (0, common_1.Get)('payouts'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getPayouts", null);
__decorate([
    (0, common_1.Get)('pharmacies'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "listPharmacies", null);
__decorate([
    (0, common_1.Patch)('pharmacies/:id/toggle'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "togglePharmacy", null);
__decorate([
    (0, common_1.Get)('labs'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "listLabCenters", null);
__decorate([
    (0, common_1.Patch)('labs/:id/toggle'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "toggleLab", null);
__decorate([
    (0, common_1.Get)('online-users'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getOnlineUsers", null);
__decorate([
    (0, common_1.Get)('activity'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "recentActivity", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
