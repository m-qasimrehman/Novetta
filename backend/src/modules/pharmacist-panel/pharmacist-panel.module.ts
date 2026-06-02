import { Module } from '@nestjs/common'
import { PharmacistPanelController } from './pharmacist-panel.controller'
import { PharmacistPanelService } from './pharmacist-panel.service'
import { PrismaModule } from '../../lib/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [PharmacistPanelController],
  providers: [PharmacistPanelService],
})
export class PharmacistPanelModule {}
