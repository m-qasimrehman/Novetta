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
exports.DoctorPanelController = void 0;
const common_1 = require("@nestjs/common");
const doctor_panel_service_1 = require("./doctor-panel.service");
const jwt_auth_guard_1 = require("../auth/strategies/jwt-auth.guard");
let DoctorPanelController = class DoctorPanelController {
    service;
    constructor(service) {
        this.service = service;
    }
    getProfile(req) {
        return this.service.getProfile(req.user.sub);
    }
    updateProfile(req, body) {
        return this.service.updateProfile(req.user.sub, body);
    }
    setOnlineStatus(req, body) {
        return this.service.setOnlineStatus(req.user.sub, body.isOnline);
    }
    updateHomeVisits(req, body) {
        return this.service.updateHomeVisits(req.user.sub, body.homeVisits, body.homeVisitAreas);
    }
    getAvailability(req) {
        return this.service.getAvailability(req.user.sub);
    }
    updateAvailability(req, body) {
        return this.service.updateAvailability(req.user.sub, body.slots ?? []);
    }
    addCertification(req, body) {
        return this.service.addCertification(req.user.sub, body.name, body.url);
    }
    removeCertification(req, index) {
        return this.service.removeCertification(req.user.sub, Number(index));
    }
    getStats(req) {
        return this.service.getStats(req.user.sub);
    }
    // ── Appointments ──────────────────────────────────────────────────────────────
    getAppointments(req, status, page) {
        return this.service.getAppointments(req.user.sub, status, Number(page) || 1);
    }
    updateAppointmentStatus(id, body, req) {
        return this.service.updateAppointmentStatus(req.user.sub, id, body.status, body.newDate);
    }
    // ── Patient Records ───────────────────────────────────────────────────────────
    getPatientRecords(patientId, req) {
        return this.service.getPatientRecords(req.user.sub, patientId);
    }
    // ── Prescriptions ─────────────────────────────────────────────────────────────
    issuePrescription(body, req) {
        return this.service.issuePrescription(req.user.sub, body);
    }
    getDoctorPrescriptions(req, page) {
        return this.service.getDoctorPrescriptions(req.user.sub, Number(page) || 1);
    }
    // ── Chat ─────────────────────────────────────────────────────────────────────
    getMessages(req) {
        return this.service.getMessages(req.user.sub);
    }
    sendMessage(body, req) {
        return this.service.sendMessage(req.user.sub, body.receiverId, body.message);
    }
};
exports.DoctorPanelController = DoctorPanelController;
__decorate([
    (0, common_1.Get)('profile'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DoctorPanelController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Put)('profile'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], DoctorPanelController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Patch)('online-status'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], DoctorPanelController.prototype, "setOnlineStatus", null);
__decorate([
    (0, common_1.Patch)('home-visits'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], DoctorPanelController.prototype, "updateHomeVisits", null);
__decorate([
    (0, common_1.Get)('availability'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DoctorPanelController.prototype, "getAvailability", null);
__decorate([
    (0, common_1.Put)('availability'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], DoctorPanelController.prototype, "updateAvailability", null);
__decorate([
    (0, common_1.Post)('certifications'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], DoctorPanelController.prototype, "addCertification", null);
__decorate([
    (0, common_1.Delete)('certifications/:index'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('index')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], DoctorPanelController.prototype, "removeCertification", null);
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DoctorPanelController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('appointments'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], DoctorPanelController.prototype, "getAppointments", null);
__decorate([
    (0, common_1.Patch)('appointments/:id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], DoctorPanelController.prototype, "updateAppointmentStatus", null);
__decorate([
    (0, common_1.Get)('patients/:id/records'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], DoctorPanelController.prototype, "getPatientRecords", null);
__decorate([
    (0, common_1.Post)('prescriptions'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], DoctorPanelController.prototype, "issuePrescription", null);
__decorate([
    (0, common_1.Get)('prescriptions'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], DoctorPanelController.prototype, "getDoctorPrescriptions", null);
__decorate([
    (0, common_1.Get)('messages'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DoctorPanelController.prototype, "getMessages", null);
__decorate([
    (0, common_1.Post)('messages'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], DoctorPanelController.prototype, "sendMessage", null);
exports.DoctorPanelController = DoctorPanelController = __decorate([
    (0, common_1.Controller)('doctor-panel'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [doctor_panel_service_1.DoctorPanelService])
], DoctorPanelController);
