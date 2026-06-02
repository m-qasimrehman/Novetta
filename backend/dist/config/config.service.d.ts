import { ConfigService as NestConfigService } from '@nestjs/config';
export declare class ConfigService {
    private readonly config;
    constructor(config: NestConfigService);
    get(key: string, defaultValue?: string): any;
}
