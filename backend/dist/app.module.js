"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const config_service_1 = require("./config/config.service");
const prisma_module_1 = require("./lib/prisma.module");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const doctors_module_1 = require("./modules/doctors/doctors.module");
const appointments_module_1 = require("./modules/appointments/appointments.module");
const telehealth_module_1 = require("./modules/telehealth/telehealth.module");
const prescriptions_module_1 = require("./modules/prescriptions/prescriptions.module");
const medical_records_module_1 = require("./modules/medical-records/medical-records.module");
const pharmacy_module_1 = require("./modules/pharmacy/pharmacy.module");
const profile_module_1 = require("./modules/profile/profile.module");
const labs_module_1 = require("./modules/labs/labs.module");
const membership_module_1 = require("./modules/membership/membership.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const admin_module_1 = require("./modules/admin/admin.module");
const doctor_panel_module_1 = require("./modules/doctor-panel/doctor-panel.module");
const pharmacist_panel_module_1 = require("./modules/pharmacist-panel/pharmacist-panel.module");
const lab_coordinator_module_1 = require("./modules/lab-coordinator/lab-coordinator.module");
const chat_module_1 = require("./modules/chat/chat.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            doctors_module_1.DoctorsModule,
            appointments_module_1.AppointmentsModule,
            telehealth_module_1.TelehealthModule,
            prescriptions_module_1.PrescriptionsModule,
            medical_records_module_1.MedicalRecordsModule,
            pharmacy_module_1.PharmacyModule,
            profile_module_1.ProfileModule,
            labs_module_1.LabsModule,
            membership_module_1.MembershipModule,
            notifications_module_1.NotificationsModule,
            admin_module_1.AdminModule,
            doctor_panel_module_1.DoctorPanelModule,
            pharmacist_panel_module_1.PharmacistPanelModule,
            lab_coordinator_module_1.LabCoordinatorModule,
            chat_module_1.ChatModule,
        ],
        controllers: [],
        providers: [config_service_1.ConfigService],
    })
], AppModule);
