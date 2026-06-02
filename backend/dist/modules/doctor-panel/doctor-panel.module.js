"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorPanelModule = void 0;
const common_1 = require("@nestjs/common");
const doctor_panel_controller_1 = require("./doctor-panel.controller");
const doctor_panel_service_1 = require("./doctor-panel.service");
let DoctorPanelModule = class DoctorPanelModule {
};
exports.DoctorPanelModule = DoctorPanelModule;
exports.DoctorPanelModule = DoctorPanelModule = __decorate([
    (0, common_1.Module)({
        controllers: [doctor_panel_controller_1.DoctorPanelController],
        providers: [doctor_panel_service_1.DoctorPanelService],
    })
], DoctorPanelModule);
