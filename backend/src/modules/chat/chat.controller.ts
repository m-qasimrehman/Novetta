import { Controller, Get, Post, Param, Body, Request, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { ChatService } from './chat.service'

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get(':partnerId')
  getConversation(@Param('partnerId') partnerId: string, @Request() req: any) {
    return this.chatService.getConversation(req.user.sub, partnerId)
  }

  @Post('send')
  sendMessage(@Body() body: { receiverId: string; message: string }, @Request() req: any) {
    return this.chatService.sendMessage(req.user.sub, body.receiverId, body.message)
  }

  @Get(':doctorUserId/limit')
  getLimit(@Param('doctorUserId') doctorUserId: string, @Request() req: any) {
    return this.chatService.getMessageCount(req.user.sub, doctorUserId)
  }
}
