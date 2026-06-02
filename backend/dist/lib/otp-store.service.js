"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtpStoreService = void 0;
const common_1 = require("@nestjs/common");
let OtpStoreService = class OtpStoreService {
    store = new Map();
    set(key, value, ttlSeconds) {
        this.store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
    }
    get(key) {
        const entry = this.store.get(key);
        if (!entry)
            return null;
        if (Date.now() > entry.expiresAt) {
            this.store.delete(key);
            return null;
        }
        return entry.value;
    }
    del(key) {
        this.store.delete(key);
    }
};
exports.OtpStoreService = OtpStoreService;
exports.OtpStoreService = OtpStoreService = __decorate([
    (0, common_1.Injectable)()
], OtpStoreService);
