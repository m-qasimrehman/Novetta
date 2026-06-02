import {
  Controller, Get, Post, Patch, Param, Body, Query,
  UseGuards, Request, UseInterceptors, UploadedFile,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { PharmacyService } from './pharmacy.service'
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard'

@Controller('pharmacy')
export class PharmacyController {
  constructor(private pharmacyService: PharmacyService) {}

  @Get('medicines')
  searchMedicines(
    @Query('q') q?: string,
    @Query('category') category?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.pharmacyService.searchMedicines({
      q, category,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    })
  }

  @Get('medicines/categories')
  getCategories() {
    return this.pharmacyService.getCategories()
  }

  @Get('medicines/:id')
  findMedicine(@Param('id') id: string) {
    return this.pharmacyService.findMedicineById(id)
  }

  @Get('barcode/:code')
  lookupBarcode(@Param('code') code: string) {
    return this.pharmacyService.lookupBarcode(code)
  }

  @Get('compare/:medicineId')
  comparePrices(@Param('medicineId') medicineId: string) {
    return this.pharmacyService.comparePrices(medicineId)
  }

  @UseGuards(JwtAuthGuard)
  @Post('ocr-scan')
  @UseInterceptors(FileInterceptor('prescription'))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  scanPrescription(@UploadedFile() file?: any) {
    return this.pharmacyService.scanPrescription(file?.originalname)
  }

  @UseGuards(JwtAuthGuard)
  @Post('pharmacist-consult')
  pharmacistConsult(@Body() body: { symptoms: string[] }) {
    if (!body.symptoms || !body.symptoms.length) {
      return this.pharmacyService.pharmacistConsult(['general'])
    }
    return this.pharmacyService.pharmacistConsult(body.symptoms)
  }

  @UseGuards(JwtAuthGuard)
  @Post('orders')
  createOrder(
    @Body() body: {
      items: { medicineId: string; quantity: number }[]
      deliveryType: string
      address?: string
      prescriptionId?: string
      notes?: string
      couponCode?: string
    },
    @Request() req: any,
  ) {
    return this.pharmacyService.createOrder(req.user.sub, body)
  }

  @UseGuards(JwtAuthGuard)
  @Get('orders')
  listOrders(@Request() req: any) {
    return this.pharmacyService.listOrders(req.user.sub)
  }

  @UseGuards(JwtAuthGuard)
  @Get('orders/:id/tracking')
  getOrderTracking(@Param('id') id: string, @Request() req: any) {
    return this.pharmacyService.getOrderTracking(id, req.user.sub)
  }

  @UseGuards(JwtAuthGuard)
  @Get('orders/:id')
  getOrder(@Param('id') id: string, @Request() req: any) {
    return this.pharmacyService.getOrder(id, req.user.sub)
  }

  // ── Pharmacies ────────────────────────────────────────────────────────────────

  @Get('pharmacies')
  listPharmacies(@Query('city') city?: string) {
    return this.pharmacyService.listPharmacies(city)
  }

  @Get('pharmacies/:id/inventory')
  getPharmacyInventory(@Param('id') pharmacyId: string, @Query('q') q?: string) {
    return this.pharmacyService.getPharmacyInventory(pharmacyId, q)
  }

  // ── Patient Tele-Pharmacist Session ───────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Post('consult-sessions')
  createConsultSession(@Body() body: { symptoms: string[]; pharmacyId?: string }, @Request() req: any) {
    return this.pharmacyService.createConsultSession(req.user.sub, body.symptoms, body.pharmacyId)
  }

  @UseGuards(JwtAuthGuard)
  @Get('consult-sessions/my')
  getMyConsultSession(@Request() req: any) {
    return this.pharmacyService.getMyConsultSessions(req.user.sub)
  }

  @UseGuards(JwtAuthGuard)
  @Patch('orders/:id/cancel')
  cancelOrder(@Param('id') id: string, @Request() req: any) {
    return this.pharmacyService.cancelOrder(id, req.user.sub)
  }

  @UseGuards(JwtAuthGuard)
  @Post('orders/:id/delivery-otp')
  generateDeliveryOtp(@Param('id') id: string, @Request() req: any) {
    return this.pharmacyService.generateDeliveryOtp(id, req.user.sub)
  }

  @UseGuards(JwtAuthGuard)
  @Patch('orders/:id/confirm-delivery')
  confirmDelivery(@Param('id') id: string, @Body() body: { otp: string }, @Request() req: any) {
    return this.pharmacyService.confirmDeliveryOtp(id, req.user.sub, body.otp)
  }

  @UseGuards(JwtAuthGuard)
  @Get('chat/:pharmacistId')
  getPatientChat(@Param('pharmacistId') pharmacistId: string, @Request() req: any) {
    return this.pharmacyService.getPatientChatMessages(req.user.sub, pharmacistId)
  }

  @UseGuards(JwtAuthGuard)
  @Post('chat')
  sendPatientMessage(@Body() body: { receiverId: string; message: string }, @Request() req: any) {
    return this.pharmacyService.sendPatientMessage(req.user.sub, body.receiverId, body.message)
  }

  @UseGuards(JwtAuthGuard)
  @Patch('consult-sessions/:id/cancel')
  cancelConsultSession(@Param('id') id: string, @Request() req: any) {
    return this.pharmacyService.cancelConsultSession(req.user.sub, id)
  }
}
