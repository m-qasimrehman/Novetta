import { Controller, Get, Post, Patch, Param, Body, UseGuards, Request } from '@nestjs/common'
import { TelehealthService } from './telehealth.service'
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard'

@UseGuards(JwtAuthGuard)
@Controller('telehealth')
export class TelehealthController {
  constructor(private telehealthService: TelehealthService) {}

  @Get()
  listMySessions(@Request() req: any) {
    return this.telehealthService.listForPatient(req.user.sub)
  }

  @Get(':id')
  getSession(@Param('id') id: string, @Request() req: any) {
    return this.telehealthService.getSession(id, req.user.sub)
  }

  @Post('start/:appointmentId')
  startSession(@Param('appointmentId') appointmentId: string, @Request() req: any) {
    return this.telehealthService.startSession(appointmentId, req.user.sub)
  }

  @Patch(':id/end')
  endSession(@Param('id') id: string, @Request() req: any) {
    return this.telehealthService.endSession(id, req.user.sub)
  }

  @Post(':id/notes')
  addNote(
    @Param('id') id: string,
    @Body() body: { diagnosis?: string; notes?: string },
    @Request() req: any,
  ) {
    return this.telehealthService.addConsultationNote(id, req.user.sub, body)
  }

  @Post(':id/prescriptions')
  addPrescription(
    @Param('id') id: string,
    @Body() body: {
      notes?: string
      items: { medicineName: string; dosage?: string; frequency?: string; duration?: string; instructions?: string }[]
    },
    @Request() req: any,
  ) {
    return this.telehealthService.addPrescription(id, req.user.sub, body)
  }

  @Post(':id/lab-orders')
  addLabOrder(
    @Param('id') id: string,
    @Body() body: { testName: string; instructions?: string },
    @Request() req: any,
  ) {
    return this.telehealthService.addLabOrder(id, req.user.sub, body)
  }
}
