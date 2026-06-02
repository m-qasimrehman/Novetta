import { Controller, Get, Post, Body, Query, UseGuards, Req } from '@nestjs/common'
import { MembershipService } from './membership.service'
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard'
import type { Request } from 'express'

@Controller('membership')
export class MembershipController {
  constructor(private svc: MembershipService) {}

  @Get('plans')
  listPlans() { return this.svc.listPlans() }

  @Post('subscribe')
  @UseGuards(JwtAuthGuard)
  subscribe(@Req() req: Request, @Body() body: { planId: string }) {
    return this.svc.subscribe((req as any).user?.sub, body.planId)
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  myMembership(@Req() req: Request) {
    return this.svc.myMembership((req as any).user?.sub)
  }

  @Get('coupons')
  listCoupons() { return this.svc.listCoupons() }

  @Post('apply-coupon')
  applyCoupon(@Body() body: { code: string; amount: number }) {
    return this.svc.applyCoupon(body.code, body.amount)
  }

  @Post('seed')
  seed() { return this.svc.seedPlans() }
}
