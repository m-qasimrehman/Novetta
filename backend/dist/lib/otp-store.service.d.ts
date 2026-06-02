export declare class OtpStoreService {
    private readonly store;
    set(key: string, value: string, ttlSeconds: number): void;
    get(key: string): string | null;
    del(key: string): void;
}
