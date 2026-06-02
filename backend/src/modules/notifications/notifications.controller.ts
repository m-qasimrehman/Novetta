import { Controller, Get, Patch, Param, UseGuards, Req } from '@nestjs/common'
import { NotificationsService } from './notifications.service'
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard'
import type { Request } from 'express'

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private svc: NotificationsService) {}

  @Get()
  list(@Req() req: Request) { return this.svc.list((req as any).user?.sub) }

  @Get('unread-count')
  unreadCount(@Req() req: Request) { return this.svc.unreadCount((req as any).user?.sub) }

  @Patch(':id/read')
  markRead(@Param('id') id: string, @Req() req: Request) { return this.svc.markRead(id, (req as any).user?.sub) }

  @Patch('read-all')
  markAllRead(@Req() req: Request) { return this.svc.markAllRead((req as any).user?.sub) }
}
