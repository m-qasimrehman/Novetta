import { Module } from '@nestjs/common'
import { DoctorPanelController } from './doctor-panel.controller'
import { DoctorPanelService } from './doctor-panel.service'

@Module({
  controllers: [DoctorPanelController],
  providers: [DoctorPanelService],
})
export class DoctorPanelModule {}
