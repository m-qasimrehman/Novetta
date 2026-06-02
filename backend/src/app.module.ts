import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ConfigService } from './config/config.service'
import { PrismaModule } from './lib/prisma.module'
import { AuthModule } from './modules/auth/auth.module'
import { UsersModule } from './modules/users/users.module'
import { DoctorsModule } from './modules/doctors/doctors.module'
import { AppointmentsModule } from './modules/appointments/appointments.module'
import { TelehealthModule } from './modules/telehealth/telehealth.module'
import { PrescriptionsModule } from './modules/prescriptions/prescriptions.module'
import { MedicalRecordsModule } from './modules/medical-records/medical-records.module'
import { PharmacyModule } from './modules/pharmacy/pharmacy.module'
import { ProfileModule } from './modules/profile/profile.module'
import { LabsModule } from './modules/labs/labs.module'
import { MembershipModule } from './modules/membership/membership.module'
import { NotificationsModule } from './modules/notifications/notifications.module'
import { AdminModule } from './modules/admin/admin.module'
import { DoctorPanelModule } from './modules/doctor-panel/doctor-panel.module'
import { PharmacistPanelModule } from './modules/pharmacist-panel/pharmacist-panel.module'
import { LabCoordinatorModule } from './modules/lab-coordinator/lab-coordinator.module'
import { ChatModule } from './modules/chat/chat.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    DoctorsModule,
    AppointmentsModule,
    TelehealthModule,
    PrescriptionsModule,
    MedicalRecordsModule,
    PharmacyModule,
    ProfileModule,
    LabsModule,
    MembershipModule,
    NotificationsModule,
    AdminModule,
    DoctorPanelModule,
    PharmacistPanelModule,
    LabCoordinatorModule,
    ChatModule,
  ],
  controllers: [],
  providers: [ConfigService],
})
export class AppModule {}
