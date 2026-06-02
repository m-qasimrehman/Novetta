import { Controller, Get, Put, Patch, Post, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common'
import { DoctorPanelService } from './doctor-panel.service'
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard'

@Controller('doctor-panel')
@UseGuards(JwtAuthGuard)
export class DoctorPanelController {
  constructor(private service: DoctorPanelService) {}

  @Get('profile')
  getProfile(@Request() req: any) {
    return this.service.getProfile(req.user.sub)
  }

  @Put('profile')
  updateProfile(@Request() req: any, @Body() body: any) {
    return this.service.updateProfile(req.user.sub, body)
  }

  @Patch('online-status')
  setOnlineStatus(@Request() req: any, @Body() body: { isOnline: boolean }) {
    return this.service.setOnlineStatus(req.user.sub, body.isOnline)
  }

  @Patch('home-visits')
  updateHomeVisits(@Request() req: any, @Body() body: { homeVisits: boolean; homeVisitAreas?: string[] }) {
    return this.service.updateHomeVisits(req.user.sub, body.homeVisits, body.homeVisitAreas)
  }

  @Get('availability')
  getAvailability(@Request() req: any) {
    return this.service.getAvailability(req.user.sub)
  }

  @Put('availability')
  updateAvailability(@Request() req: any, @Body() body: { slots: any[] }) {
    return this.service.updateAvailability(req.user.sub, body.slots ?? [])
  }

  @Post('certifications')
  addCertification(@Request() req: any, @Body() body: { name: string; url: string }) {
    return this.service.addCertification(req.user.sub, body.name, body.url)
  }

  @Delete('certifications/:index')
  removeCertification(@Request() req: any, @Param('index') index: string) {
    return this.service.removeCertification(req.user.sub, Number(index))
  }

  @Get('stats')
  getStats(@Request() req: any) {
    return this.service.getStats(req.user.sub)
  }

  // ── Appointments ──────────────────────────────────────────────────────────────

  @Get('appointments')
  getAppointments(@Request() req: any, @Query('status') status?: string, @Query('page') page?: string) {
    return this.service.getAppointments(req.user.sub, status, Number(page) || 1)
  }

  @Patch('appointments/:id/status')
  updateAppointmentStatus(@Param('id') id: string, @Body() body: { status: string; newDate?: string }, @Request() req: any) {
    return this.service.updateAppointmentStatus(req.user.sub, id, body.status, body.newDate)
  }

  // ── Patient Records ───────────────────────────────────────────────────────────

  @Get('patients/:id/records')
  getPatientRecords(@Param('id') patientId: string, @Request() req: any) {
    return this.service.getPatientRecords(req.user.sub, patientId)
  }

  // ── Prescriptions ─────────────────────────────────────────────────────────────

  @Post('prescriptions')
  issuePrescription(@Body() body: any, @Request() req: any) {
    return this.service.issuePrescription(req.user.sub, body)
  }

  @Get('prescriptions')
  getDoctorPrescriptions(@Request() req: any, @Query('page') page?: string) {
    return this.service.getDoctorPrescriptions(req.user.sub, Number(page) || 1)
  }

  // ── Chat ─────────────────────────────────────────────────────────────────────

  @Get('messages')
  getMessages(@Request() req: any) {
    return this.service.getMessages(req.user.sub)
  }

  @Post('messages')
  sendMessage(@Body() body: { receiverId: string; message: string }, @Request() req: any) {
    return this.service.sendMessage(req.user.sub, body.receiverId, body.message)
  }
}
