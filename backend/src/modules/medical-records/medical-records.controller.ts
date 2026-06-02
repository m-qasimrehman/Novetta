import { Controller, Get, Post, Delete, Param, Body, UseGuards, Request } from '@nestjs/common'
import { MedicalRecordsService } from './medical-records.service'
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard'

@UseGuards(JwtAuthGuard)
@Controller('medical-records')
export class MedicalRecordsController {
  constructor(private medicalRecordsService: MedicalRecordsService) {}

  @Get()
  list(@Request() req: any) {
    return this.medicalRecordsService.list(req.user.sub)
  }

  @Post()
  create(
    @Body() body: { title: string; description?: string; recordType?: string; fileUrl?: string },
    @Request() req: any,
  ) {
    return this.medicalRecordsService.create(req.user.sub, body)
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Request() req: any) {
    return this.medicalRecordsService.delete(id, req.user.sub)
  }
}
