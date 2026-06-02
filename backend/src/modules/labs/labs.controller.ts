import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards, Req, Patch } from '@nestjs/common'
import { LabsService } from './labs.service'
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard'
import type { Request } from 'express'

@Controller('labs')
export class LabsController {
  constructor(private labs: LabsService) {}

  @Get('tests')
  listTests(@Query('category') category?: string, @Query('q') q?: string) {
    return this.labs.listTests(category, q)
  }

  @Get('tests/:id')
  getTest(@Param('id') id: string) {
    return this.labs.getTest(id)
  }

  @Get('packages')
  listPackages(@Query('labCenterId') labCenterId?: string) {
    return this.labs.listPackages(labCenterId)
  }

  @Get('centers')
  listCenters(@Query('city') city?: string) {
    return this.labs.listCenters(city)
  }

  @Post('book')
  @UseGuards(JwtAuthGuard)
  bookTest(@Req() req: Request, @Body() dto: any) {
    const userId = (req as any).user?.sub
    return this.labs.bookTest(userId, dto)
  }

  @Get('my-bookings')
  @UseGuards(JwtAuthGuard)
  myBookings(@Req() req: Request) {
    const userId = (req as any).user?.sub
    return this.labs.myBookings(userId)
  }

  @Delete('bookings/:id')
  @UseGuards(JwtAuthGuard)
  cancelBooking(@Param('id') id: string, @Req() req: Request) {
    const userId = (req as any).user?.sub
    return this.labs.cancelBooking(id, userId)
  }

  @Patch('bookings/:id/cancel')
  @UseGuards(JwtAuthGuard)
  cancelBookingPatch(@Param('id') id: string, @Req() req: Request) {
    const userId = (req as any).user?.sub
    return this.labs.cancelBooking(id, userId)
  }

  @Post('seed')
  seed() {
    return this.labs.seedTests()
  }
}
