"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LabCoordinatorModule = void 0;
const common_1 = require("@nestjs/common");
const lab_coordinator_controller_1 = require("./lab-coordinator.controller");
const lab_coordinator_service_1 = require("./lab-coordinator.service");
const prisma_module_1 = require("../../lib/prisma.module");
let LabCoordinatorModule = class LabCoordinatorModule {
};
exports.LabCoordinatorModule = LabCoordinatorModule;
exports.LabCoordinatorModule = LabCoordinatorModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [lab_coordinator_controller_1.LabCoordinatorController],
        providers: [lab_coordinator_service_1.LabCoordinatorService],
    })
], LabCoordinatorModule);
