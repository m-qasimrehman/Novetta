import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../lib/prisma.service'
import type { Prisma } from '@prisma/client'

@Injectable()
export class UsersRepository {
  constructor(private prisma: PrismaService) {}

  createUser(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({ data })
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } })
  }

  findByPhone(phone: string) {
    return this.prisma.user.findFirst({ where: { phone } })
  }

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } })
  }

  update(id: string, data: Prisma.UserUpdateInput) {
    return this.prisma.user.update({ where: { id }, data })
  }
}
