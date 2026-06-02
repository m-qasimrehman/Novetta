import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common'
import { PrescriptionsService } from './prescriptions.service'
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard'

@UseGuards(JwtAuthGuard)
@Controller('prescriptions')
export class PrescriptionsController {
  constructor(private prescriptionsService: PrescriptionsService) {}

  @Get()
  list(@Request() req: any) {
    return this.prescriptionsService.listForPatient(req.user.sub)
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.prescriptionsService.findOne(id, req.user.sub)
  }
}
