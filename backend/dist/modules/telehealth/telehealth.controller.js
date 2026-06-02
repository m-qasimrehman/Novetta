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
exports.TelehealthController = void 0;
const common_1 = require("@nestjs/common");
const telehealth_service_1 = require("./telehealth.service");
const jwt_auth_guard_1 = require("../auth/strategies/jwt-auth.guard");
let TelehealthController = class TelehealthController {
    telehealthService;
    constructor(telehealthService) {
        this.telehealthService = telehealthService;
    }
    listMySessions(req) {
        return this.telehealthService.listForPatient(req.user.sub);
    }
    getSession(id, req) {
        return this.telehealthService.getSession(id, req.user.sub);
    }
    startSession(appointmentId, req) {
        return this.telehealthService.startSession(appointmentId, req.user.sub);
    }
    endSession(id, req) {
        return this.telehealthService.endSession(id, req.user.sub);
    }
    addNote(id, body, req) {
        return this.telehealthService.addConsultationNote(id, req.user.sub, body);
    }
    addPrescription(id, body, req) {
        return this.telehealthService.addPrescription(id, req.user.sub, body);
    }
    addLabOrder(id, body, req) {
        return this.telehealthService.addLabOrder(id, req.user.sub, body);
    }
};
exports.TelehealthController = TelehealthController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TelehealthController.prototype, "listMySessions", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TelehealthController.prototype, "getSession", null);
__decorate([
    (0, common_1.Post)('start/:appointmentId'),
    __param(0, (0, common_1.Param)('appointmentId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TelehealthController.prototype, "startSession", null);
__decorate([
    (0, common_1.Patch)(':id/end'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TelehealthController.prototype, "endSession", null);
__decorate([
    (0, common_1.Post)(':id/notes'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], TelehealthController.prototype, "addNote", null);
__decorate([
    (0, common_1.Post)(':id/prescriptions'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], TelehealthController.prototype, "addPrescription", null);
__decorate([
    (0, common_1.Post)(':id/lab-orders'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], TelehealthController.prototype, "addLabOrder", null);
exports.TelehealthController = TelehealthController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('telehealth'),
    __metadata("design:paramtypes", [telehealth_service_1.TelehealthService])
], TelehealthController);
