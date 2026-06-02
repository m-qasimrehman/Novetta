import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { UsersModule } from '../users/users.module'
import { PrismaModule } from '../../lib/prisma.module'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtStrategy } from './strategies/jwt.strategy'
import { NotificationService } from '../../lib/notification.service'
import { OtpStoreService } from '../../lib/otp-store.service'

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    PrismaModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        secret: config.get('JWT_ACCESS_SECRET') || 'change_me_access',
        signOptions: { expiresIn: config.get('JWT_ACCESS_EXPIRES') || '15m' },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy, NotificationService, OtpStoreService],
  controllers: [AuthController],
})
export class AuthModule {}
