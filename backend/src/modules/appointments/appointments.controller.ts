import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, Request } from '@nestjs/common'
import { AppointmentsService } from './appointments.service'
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard'

@UseGuards(JwtAuthGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(private appointmentsService: AppointmentsService) {}

  @Post()
  book(
    @Body() body: {
      doctorId: string
      slotId?: string
      appointmentDate: string
      consultationType: string
      reason?: string
      notes?: string
    },
    @Request() req: any,
  ) {
    return this.appointmentsService.book(req.user.sub, body)
  }

  @Get()
  list(@Request() req: any, @Query('status') status?: string) {
    return this.appointmentsService.listForPatient(req.user.sub, status)
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.appointmentsService.findOne(id, req.user.sub)
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @Request() req: any) {
    return this.appointmentsService.cancel(id, req.user.sub)
  }

  @Patch(':id/confirm-payment')
  confirmPayment(@Param('id') id: string, @Request() req: any) {
    return this.appointmentsService.confirmPayment(id, req.user.sub)
  }

  @Patch(':id/reschedule')
  reschedule(
    @Param('id') id: string,
    @Body() body: { appointmentDate: string },
    @Request() req: any,
  ) {
    return this.appointmentsService.reschedule(id, req.user.sub, body.appointmentDate)
  }
}
