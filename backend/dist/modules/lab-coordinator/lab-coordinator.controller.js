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
exports.LabCoordinatorController = void 0;
const common_1 = require("@nestjs/common");
const lab_coordinator_service_1 = require("./lab-coordinator.service");
const jwt_auth_guard_1 = require("../auth/strategies/jwt-auth.guard");
let LabCoordinatorController = class LabCoordinatorController {
    svc;
    constructor(svc) {
        this.svc = svc;
    }
    // ── Center ─────────────────────────────────────────────────────────────
    getCenter(req) {
        return this.svc.getMyCenter(req.user.sub);
    }
    upsertCenter(req, body) {
        return this.svc.upsertCenter(req.user.sub, body);
    }
    // ── Stats ──────────────────────────────────────────────────────────────
    getStats(req) {
        return this.svc.getStats(req.user.sub);
    }
    // ── Tests ──────────────────────────────────────────────────────────────
    getTests(req, q) {
        return this.svc.getTests(req.user.sub, q);
    }
    createTest(req, body) {
        return this.svc.createTest(req.user.sub, body);
    }
    updateTest(req, id, body) {
        return this.svc.updateTest(req.user.sub, id, body);
    }
    deleteTest(req, id) {
        return this.svc.deleteTest(req.user.sub, id);
    }
    // ── Packages ───────────────────────────────────────────────────────────
    getPackages(req) {
        return this.svc.getPackages(req.user.sub);
    }
    createPackage(req, body) {
        return this.svc.createPackage(req.user.sub, body);
    }
    updatePackage(req, id, body) {
        return this.svc.updatePackage(req.user.sub, id, body);
    }
    deletePackage(req, id) {
        return this.svc.deletePackage(req.user.sub, id);
    }
    // ── Bookings ───────────────────────────────────────────────────────────
    getBookings(req, status, collectionType, date, page, limit) {
        return this.svc.getBookings(req.user.sub, {
            status,
            collectionType,
            date,
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 20,
        });
    }
    updateStatus(req, id, body) {
        return this.svc.updateBookingStatus(req.user.sub, id, body.status);
    }
    assignPhlebotomist(req, id, body) {
        return this.svc.assignPhlebotomist(req.user.sub, id, body.name, body.phone);
    }
    uploadReport(req, id, body) {
        return this.svc.uploadReport(req.user.sub, id, body.reportUrl, body.reportNote);
    }
};
exports.LabCoordinatorController = LabCoordinatorController;
__decorate([
    (0, common_1.Get)('center'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LabCoordinatorController.prototype, "getCenter", null);
__decorate([
    (0, common_1.Patch)('center'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], LabCoordinatorController.prototype, "upsertCenter", null);
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LabCoordinatorController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('tests'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], LabCoordinatorController.prototype, "getTests", null);
__decorate([
    (0, common_1.Post)('tests'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], LabCoordinatorController.prototype, "createTest", null);
__decorate([
    (0, common_1.Patch)('tests/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], LabCoordinatorController.prototype, "updateTest", null);
__decorate([
    (0, common_1.Delete)('tests/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], LabCoordinatorController.prototype, "deleteTest", null);
__decorate([
    (0, common_1.Get)('packages'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LabCoordinatorController.prototype, "getPackages", null);
__decorate([
    (0, common_1.Post)('packages'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], LabCoordinatorController.prototype, "createPackage", null);
__decorate([
    (0, common_1.Patch)('packages/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], LabCoordinatorController.prototype, "updatePackage", null);
__decorate([
    (0, common_1.Delete)('packages/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], LabCoordinatorController.prototype, "deletePackage", null);
__decorate([
    (0, common_1.Get)('bookings'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('collectionType')),
    __param(3, (0, common_1.Query)('date')),
    __param(4, (0, common_1.Query)('page')),
    __param(5, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], LabCoordinatorController.prototype, "getBookings", null);
__decorate([
    (0, common_1.Patch)('bookings/:id/status'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], LabCoordinatorController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Patch)('bookings/:id/assign'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], LabCoordinatorController.prototype, "assignPhlebotomist", null);
__decorate([
    (0, common_1.Patch)('bookings/:id/report'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], LabCoordinatorController.prototype, "uploadReport", null);
exports.LabCoordinatorController = LabCoordinatorController = __decorate([
    (0, common_1.Controller)('lab-coordinator'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [lab_coordinator_service_1.LabCoordinatorService])
], LabCoordinatorController);
