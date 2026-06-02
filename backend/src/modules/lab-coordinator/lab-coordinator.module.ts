import { Module } from '@nestjs/common'
import { LabCoordinatorController } from './lab-coordinator.controller'
import { LabCoordinatorService } from './lab-coordinator.service'
import { PrismaModule } from '../../lib/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [LabCoordinatorController],
  providers: [LabCoordinatorService],
})
export class LabCoordinatorModule {}
