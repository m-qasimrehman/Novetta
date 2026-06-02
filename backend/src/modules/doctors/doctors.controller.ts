import { Controller, Get, Post, Param, Query, Body, UseGuards, Request } from '@nestjs/common'
import { DoctorsService } from './doctors.service'
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard'

@Controller('doctors')
export class DoctorsController {
  constructor(private doctorsService: DoctorsService) {}

  @Get()
  search(
    @Query('q') q?: string,
    @Query('specialization') specialization?: string,
    @Query('city') city?: string,
    @Query('type') consultationType?: string,
    @Query('minRating') minRating?: string,
    @Query('minExperience') minExperience?: string,
    @Query('maxFee') maxFee?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.doctorsService.search({
      q, specialization, city, consultationType,
      minRating: minRating ? Number(minRating) : undefined,
      minExperience: minExperience ? Number(minExperience) : undefined,
      maxFee: maxFee ? Number(maxFee) : undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 12,
    })
  }

  @Get('specializations')
  getSpecializations() {
    return this.doctorsService.getSpecializations()
  }

  @Get('cities')
  getCities() {
    return this.doctorsService.getCities()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.doctorsService.findById(id)
  }

  @Get(':id/availability')
  getAvailability(@Param('id') id: string, @Query('date') date: string) {
    const targetDate = date || new Date().toISOString().split('T')[0]
    return this.doctorsService.getAvailableSlots(id, targetDate)
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/reviews')
  addReview(
    @Param('id') id: string,
    @Body() body: { rating: number; comment?: string; appointmentId?: string },
    @Request() req: any,
  ) {
    return this.doctorsService.addReview(id, req.user.sub, body)
  }
}
