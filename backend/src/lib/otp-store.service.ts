import { Injectable } from '@nestjs/common'

interface Entry { value: string; expiresAt: number }

@Injectable()
export class OtpStoreService {
  private readonly store = new Map<string, Entry>()

  set(key: string, value: string, ttlSeconds: number): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 })
  }

  get(key: string): string | null {
    const entry = this.store.get(key)
    if (!entry) return null
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key)
      return null
    }
    return entry.value
  }

  del(key: string): void {
    this.store.delete(key)
  }
}
