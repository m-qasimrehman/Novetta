import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Request } from '@nestjs/common'
import { ProfileService } from './profile.service'
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard'

@UseGuards(JwtAuthGuard)
@Controller('profile')
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @Get()
  getProfile(@Request() req: any) {
    return this.profileService.getFullProfile(req.user.sub)
  }

  @Patch()
  updateProfile(@Body() body: { name?: string; phone?: string }, @Request() req: any) {
    return this.profileService.updateProfile(req.user.sub, body)
  }

  // Medical History
  @Get('medical-history')
  listHistory(@Request() req: any) {
    return this.profileService.listMedicalHistory(req.user.sub)
  }

  @Post('medical-history')
  addHistory(
    @Body() body: { condition: string; diagnosedAt?: string; notes?: string },
    @Request() req: any,
  ) {
    return this.profileService.addMedicalHistory(req.user.sub, body)
  }

  @Delete('medical-history/:id')
  deleteHistory(@Param('id') id: string, @Request() req: any) {
    return this.profileService.deleteMedicalHistory(id, req.user.sub)
  }

  // Dependents
  @Get('dependents')
  listDependents(@Request() req: any) {
    return this.profileService.listDependents(req.user.sub)
  }

  @Post('dependents')
  addDependent(
    @Body() body: { name: string; relationship: string; dateOfBirth?: string; gender?: string; bloodGroup?: string },
    @Request() req: any,
  ) {
    return this.profileService.addDependent(req.user.sub, body)
  }

  @Delete('dependents/:id')
  deleteDependent(@Param('id') id: string, @Request() req: any) {
    return this.profileService.deleteDependent(id, req.user.sub)
  }

  // Saved Addresses
  @Get('addresses')
  listAddresses(@Request() req: any) {
    return this.profileService.listAddresses(req.user.sub)
  }

  @Post('addresses')
  addAddress(
    @Body() body: { label: string; address: string; city?: string; isDefault?: boolean },
    @Request() req: any,
  ) {
    return this.profileService.addAddress(req.user.sub, body)
  }

  @Patch('addresses/:id/default')
  setDefault(@Param('id') id: string, @Request() req: any) {
    return this.profileService.setDefaultAddress(id, req.user.sub)
  }

  @Delete('addresses/:id')
  deleteAddress(@Param('id') id: string, @Request() req: any) {
    return this.profileService.deleteAddress(id, req.user.sub)
  }
}
