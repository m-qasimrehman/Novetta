import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, Request } from '@nestjs/common'
import { PharmacistPanelService } from './pharmacist-panel.service'
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard'

@Controller('pharmacist-panel')
@UseGuards(JwtAuthGuard)
export class PharmacistPanelController {
  constructor(private svc: PharmacistPanelService) {}

  @Get('me')
  getMe(@Request() req: any) {
    return this.svc.getMyPharmacy(req.user.sub)
  }

  // ── Queue ─────────────────────────────────────────────────────────────────────

  @Get('queue')
  getQueue(@Request() req: any) {
    return this.svc.getQueue(req.user.sub)
  }

  @Get('active-sessions')
  getActiveSessions(@Request() req: any) {
    return this.svc.getMyActiveSessions(req.user.sub)
  }

  @Patch('sessions/:id/accept')
  acceptSession(@Param('id') id: string, @Request() req: any) {
    return this.svc.acceptSession(req.user.sub, id)
  }

  @Patch('sessions/:id/complete')
  completeSession(@Param('id') id: string, @Body() body: { notes?: string }, @Request() req: any) {
    return this.svc.completeSession(req.user.sub, id, body.notes)
  }

  // ── Prescription + Digital Signature ─────────────────────────────────────────

  @Post('sessions/:id/prescribe')
  issuePrescription(@Param('id') sessionId: string, @Body() body: any, @Request() req: any) {
    return this.svc.issuePrescriptionWithSignature(req.user.sub, sessionId, body)
  }

  // ── Chat ─────────────────────────────────────────────────────────────────────

  @Get('chat/:patientId')
  getMessages(@Param('patientId') patientId: string, @Request() req: any) {
    return this.svc.getSessionMessages(req.user.sub, patientId)
  }

  @Post('chat')
  sendMessage(@Body() body: { receiverId: string; message: string }, @Request() req: any) {
    return this.svc.sendMessage(req.user.sub, body.receiverId, body.message)
  }

  // ── Patient Summary ───────────────────────────────────────────────────────────

  @Get('patients/:id/summary')
  getPatientSummary(@Param('id') patientId: string, @Request() req: any) {
    return this.svc.getPatientSummary(req.user.sub, patientId)
  }

  // ── Inventory ─────────────────────────────────────────────────────────────────

  @Get('inventory/:pharmacyId')
  getInventory(@Param('pharmacyId') pharmacyId: string, @Request() req: any) {
    return this.svc.getInventory(req.user.sub, pharmacyId)
  }

  @Post('inventory/:pharmacyId')
  upsertInventory(
    @Param('pharmacyId') pharmacyId: string,
    @Body() body: { medicineId: string; stock: number; price: number; lowThreshold?: number },
    @Request() req: any,
  ) {
    return this.svc.upsertInventory(req.user.sub, pharmacyId, body.medicineId, body.stock, body.price, body.lowThreshold)
  }

  // ── Orders ────────────────────────────────────────────────────────────────────

  @Get('orders')
  getOrders(
    @Request() req: any,
    @Query('pharmacyId') pharmacyId?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
  ) {
    return this.svc.getOrders(req.user.sub, pharmacyId, status, Number(page) || 1)
  }

  @Patch('orders/:id/status')
  updateOrderStatus(@Param('id') id: string, @Body() body: { status: string }, @Request() req: any) {
    return this.svc.updateOrderStatus(req.user.sub, id, body.status)
  }

  @Patch('orders/:id/validate-prescription')
  validatePrescription(
    @Param('id') id: string,
    @Body() body: { approved: boolean; note?: string },
    @Request() req: any,
  ) {
    return this.svc.validatePrescription(req.user.sub, id, body.approved, body.note)
  }
}
