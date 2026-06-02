import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, Request,
} from '@nestjs/common'
import { LabCoordinatorService } from './lab-coordinator.service'
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard'

@Controller('lab-coordinator')
@UseGuards(JwtAuthGuard)
export class LabCoordinatorController {
  constructor(private svc: LabCoordinatorService) {}

  // ── Center ─────────────────────────────────────────────────────────────
  @Get('center')
  getCenter(@Request() req: any) {
    return this.svc.getMyCenter(req.user.sub)
  }

  @Patch('center')
  upsertCenter(@Request() req: any, @Body() body: any) {
    return this.svc.upsertCenter(req.user.sub, body)
  }

  // ── Stats ──────────────────────────────────────────────────────────────
  @Get('stats')
  getStats(@Request() req: any) {
    return this.svc.getStats(req.user.sub)
  }

  // ── Tests ──────────────────────────────────────────────────────────────
  @Get('tests')
  getTests(@Request() req: any, @Query('q') q?: string) {
    return this.svc.getTests(req.user.sub, q)
  }

  @Post('tests')
  createTest(@Request() req: any, @Body() body: any) {
    return this.svc.createTest(req.user.sub, body)
  }

  @Patch('tests/:id')
  updateTest(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    return this.svc.updateTest(req.user.sub, id, body)
  }

  @Delete('tests/:id')
  deleteTest(@Request() req: any, @Param('id') id: string) {
    return this.svc.deleteTest(req.user.sub, id)
  }

  // ── Packages ───────────────────────────────────────────────────────────
  @Get('packages')
  getPackages(@Request() req: any) {
    return this.svc.getPackages(req.user.sub)
  }

  @Post('packages')
  createPackage(@Request() req: any, @Body() body: any) {
    return this.svc.createPackage(req.user.sub, body)
  }

  @Patch('packages/:id')
  updatePackage(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    return this.svc.updatePackage(req.user.sub, id, body)
  }

  @Delete('packages/:id')
  deletePackage(@Request() req: any, @Param('id') id: string) {
    return this.svc.deletePackage(req.user.sub, id)
  }

  // ── Bookings ───────────────────────────────────────────────────────────
  @Get('bookings')
  getBookings(
    @Request() req: any,
    @Query('status') status?: string,
    @Query('collectionType') collectionType?: string,
    @Query('date') date?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.svc.getBookings(req.user.sub, {
      status,
      collectionType,
      date,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    })
  }

  @Patch('bookings/:id/status')
  updateStatus(@Request() req: any, @Param('id') id: string, @Body() body: { status: string }) {
    return this.svc.updateBookingStatus(req.user.sub, id, body.status)
  }

  @Patch('bookings/:id/assign')
  assignPhlebotomist(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { name: string; phone: string },
  ) {
    return this.svc.assignPhlebotomist(req.user.sub, id, body.name, body.phone)
  }

  @Patch('bookings/:id/report')
  uploadReport(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { reportUrl: string; reportNote?: string },
  ) {
    return this.svc.uploadReport(req.user.sub, id, body.reportUrl, body.reportNote)
  }
}
