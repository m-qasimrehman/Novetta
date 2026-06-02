import { Injectable } from '@nestjs/common'
import { UsersRepository } from './users.repository'
import * as bcrypt from 'bcrypt'
import type { Prisma } from '@prisma/client'

@Injectable()
export class UsersService {
  constructor(private usersRepo: UsersRepository) {}

  async createUser(payload: { name: string; email: string; phone?: string; password: string; role?: string }) {
    const passwordHash = await bcrypt.hash(payload.password, 12)
    const data: Prisma.UserCreateInput = {
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      passwordHash,
      role: payload.role ?? 'patient',
      isVerified: false,
      isActive: true,
    }
    return this.usersRepo.createUser(data)
  }

  findByEmail(email: string) {
    return this.usersRepo.findByEmail(email)
  }

  findByPhone(phone: string) {
    return this.usersRepo.findByPhone(phone)
  }

  async findById(id: string) {
    const user = await this.usersRepo.findById(id)
    if (!user) return null
    return this.sanitize(user)
  }

  update(id: string, data: Prisma.UserUpdateInput) {
    return this.usersRepo.update(id, data)
  }

  sanitize(user: { passwordHash: string; [key: string]: any }) {
    const { passwordHash: _, ...safe } = user
    return safe
  }
}
