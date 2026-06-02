import { Injectable } from '@nestjs/common'
import { ConfigService as NestConfigService } from '@nestjs/config'

@Injectable()
export class ConfigService {
  constructor(private readonly config: NestConfigService) {}

  get(key: string, defaultValue?: string) {
    return this.config.get(key) ?? defaultValue
  }
}
