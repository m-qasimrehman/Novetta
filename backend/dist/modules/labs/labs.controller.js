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
exports.LabsController = void 0;
const common_1 = require("@nestjs/common");
const labs_service_1 = require("./labs.service");
const jwt_auth_guard_1 = require("../auth/strategies/jwt-auth.guard");
let LabsController = class LabsController {
    labs;
    constructor(labs) {
        this.labs = labs;
    }
    listTests(category, q) {
        return this.labs.listTests(category, q);
    }
    getTest(id) {
        return this.labs.getTest(id);
    }
    listPackages(labCenterId) {
        return this.labs.listPackages(labCenterId);
    }
    listCenters(city) {
        return this.labs.listCenters(city);
    }
    bookTest(req, dto) {
        const userId = req.user?.sub;
        return this.labs.bookTest(userId, dto);
    }
    myBookings(req) {
        const userId = req.user?.sub;
        return this.labs.myBookings(userId);
    }
    cancelBooking(id, req) {
        const userId = req.user?.sub;
        return this.labs.cancelBooking(id, userId);
    }
    cancelBookingPatch(id, req) {
        const userId = req.user?.sub;
        return this.labs.cancelBooking(id, userId);
    }
    seed() {
        return this.labs.seedTests();
    }
};
exports.LabsController = LabsController;
__decorate([
    (0, common_1.Get)('tests'),
    __param(0, (0, common_1.Query)('category')),
    __param(1, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], LabsController.prototype, "listTests", null);
__decorate([
    (0, common_1.Get)('tests/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LabsController.prototype, "getTest", null);
__decorate([
    (0, common_1.Get)('packages'),
    __param(0, (0, common_1.Query)('labCenterId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LabsController.prototype, "listPackages", null);
__decorate([
    (0, common_1.Get)('centers'),
    __param(0, (0, common_1.Query)('city')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LabsController.prototype, "listCenters", null);
__decorate([
    (0, common_1.Post)('book'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], LabsController.prototype, "bookTest", null);
__decorate([
    (0, common_1.Get)('my-bookings'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LabsController.prototype, "myBookings", null);
__decorate([
    (0, common_1.Delete)('bookings/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], LabsController.prototype, "cancelBooking", null);
__decorate([
    (0, common_1.Patch)('bookings/:id/cancel'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], LabsController.prototype, "cancelBookingPatch", null);
__decorate([
    (0, common_1.Post)('seed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LabsController.prototype, "seed", null);
exports.LabsController = LabsController = __decorate([
    (0, common_1.Controller)('labs'),
    __metadata("design:paramtypes", [labs_service_1.LabsService])
], LabsController);
