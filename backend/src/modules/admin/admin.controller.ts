import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, Req } from '@nestjs/common'
import { AdminService } from './admin.service'
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard'
import type { Request } from 'express'

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private svc: AdminService) {}

  @Get('stats')
  stats(@Req() req: Request, @Query('dateFrom') dateFrom?: string, @Query('dateTo') dateTo?: string) {
    return this.svc.stats((req as any).user?.sub, dateFrom, dateTo)
  }

  @Get('revenue')
  revenue(@Req() req: Request) {
    return this.svc.revenue((req as any).user?.sub)
  }

  @Get('users')
  listUsers(
    @Req() req: Request,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('role') role?: string,
    @Query('q') q?: string,
  ) {
    return this.svc.listUsers((req as any).user?.sub, Number(page) || 1, Number(limit) || 20, role, q)
  }

  @Patch('users/:id/toggle')
  toggleUser(@Param('id') id: string, @Req() req: Request) {
    return this.svc.toggleUserActive((req as any).user?.sub, id)
  }

  @Get('doctors')
  listDoctors(@Req() req: Request) {
    return this.svc.listDoctors((req as any).user?.sub)
  }

  @Patch('doctors/:id/verify')
  verifyDoctor(@Param('id') id: string, @Req() req: Request) {
    return this.svc.verifyDoctor((req as any).user?.sub, id)
  }

  // ── Membership Plans ──────────────────────────────────────────────────────

  @Get('plans')
  listPlans(@Req() req: Request) {
    return this.svc.listPlans((req as any).user?.sub)
  }

  @Post('plans')
  createPlan(@Body() body: any, @Req() req: Request) {
    return this.svc.createPlan((req as any).user?.sub, body)
  }

  @Patch('plans/:id')
  updatePlan(@Param('id') id: string, @Body() body: any, @Req() req: Request) {
    return this.svc.updatePlan((req as any).user?.sub, id, body)
  }

  @Delete('plans/:id')
  deletePlan(@Param('id') id: string, @Req() req: Request) {
    return this.svc.deletePlan((req as any).user?.sub, id)
  }

  @Get('membership-stats')
  membershipStats(@Req() req: Request) {
    return this.svc.membershipStats((req as any).user?.sub)
  }

  // ── Coupons ───────────────────────────────────────────────────────────────

  @Get('coupons')
  listCoupons(@Req() req: Request) {
    return this.svc.listCoupons((req as any).user?.sub)
  }

  @Post('coupons')
  createCoupon(@Body() body: any, @Req() req: Request) {
    return this.svc.createCoupon((req as any).user?.sub, body)
  }

  @Patch('coupons/:id')
  updateCoupon(@Param('id') id: string, @Body() body: any, @Req() req: Request) {
    return this.svc.updateCoupon((req as any).user?.sub, id, body)
  }

  @Delete('coupons/:id')
  deleteCoupon(@Param('id') id: string, @Req() req: Request) {
    return this.svc.deleteCoupon((req as any).user?.sub, id)
  }

  // ── Appointments & Orders ─────────────────────────────────────────────────

  @Get('appointments')
  listAllAppointments(
    @Req() req: Request,
    @Query('status') status?: string,
    @Query('page') page?: string,
  ) {
    return this.svc.listAllAppointments((req as any).user?.sub, status, Number(page) || 1)
  }

  @Get('orders')
  listAllOrders(
    @Req() req: Request,
    @Query('type') type?: string,
    @Query('page') page?: string,
  ) {
    return this.svc.listAllOrders((req as any).user?.sub, (type as any) || 'pharmacy', Number(page) || 1)
  }

  // ── Payouts ───────────────────────────────────────────────────────────────

  @Get('payouts')
  getPayouts(@Req() req: Request) {
    return this.svc.getPayouts((req as any).user?.sub)
  }

  // ── Pharmacies ────────────────────────────────────────────────────────────

  @Get('pharmacies')
  listPharmacies(@Req() req: Request) {
    return this.svc.listPharmacies((req as any).user?.sub)
  }

  @Patch('pharmacies/:id/toggle')
  togglePharmacy(@Param('id') id: string, @Req() req: Request) {
    return this.svc.togglePharmacyActive((req as any).user?.sub, id)
  }

  // ── Lab Centers ───────────────────────────────────────────────────────────

  @Get('labs')
  listLabCenters(@Req() req: Request) {
    return this.svc.listLabCenters((req as any).user?.sub)
  }

  @Patch('labs/:id/toggle')
  toggleLab(@Param('id') id: string, @Req() req: Request) {
    return this.svc.toggleLabActive((req as any).user?.sub, id)
  }

  // ── System ────────────────────────────────────────────────────────────────

  @Get('online-users')
  getOnlineUsers(@Req() req: Request) {
    return this.svc.getOnlineUsers((req as any).user?.sub)
  }

  @Get('activity')
  recentActivity(@Req() req: Request) {
    return this.svc.recentActivity((req as any).user?.sub)
  }
}
