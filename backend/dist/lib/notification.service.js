"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = __importStar(require("nodemailer"));
let NotificationService = NotificationService_1 = class NotificationService {
    config;
    logger = new common_1.Logger(NotificationService_1.name);
    transporter;
    smtpFrom;
    smtpUser;
    constructor(config) {
        this.config = config;
        const smtpHost = this.config.get('SMTP_HOST');
        const smtpUser = this.config.get('SMTP_USER');
        const smtpPass = this.config.get('SMTP_PASS');
        this.smtpFrom = this.config.get('SMTP_FROM');
        this.smtpUser = smtpUser;
        const isDev = this.config.get('NODE_ENV') !== 'production';
        this.logger.log(`SMTP — host:${smtpHost} user:${smtpUser} from:${this.smtpFrom} pass:${smtpPass ? '***SET***' : 'NOT SET'}`);
        if (smtpUser && smtpPass && this.smtpFrom) {
            const isGmail = (smtpHost ?? '').toLowerCase().includes('gmail');
            if (isGmail) {
                this.logger.log('Gmail detected — using nodemailer Gmail service preset (port 465, SSL)');
                this.transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: { user: smtpUser, pass: smtpPass },
                    logger: isDev,
                    debug: isDev,
                });
            }
            else {
                const smtpPort = Number(this.config.get('SMTP_PORT') || 587);
                this.transporter = nodemailer.createTransport({
                    host: smtpHost,
                    port: smtpPort,
                    secure: smtpPort === 465,
                    auth: { user: smtpUser, pass: smtpPass },
                    tls: { rejectUnauthorized: false },
                    logger: isDev,
                    debug: isDev,
                });
            }
        }
        else {
            const missing = [!smtpUser && 'SMTP_USER', !smtpPass && 'SMTP_PASS', !this.smtpFrom && 'SMTP_FROM']
                .filter(Boolean)
                .join(', ');
            this.logger.warn(`SMTP not configured — missing: ${missing}`);
        }
    }
    async onModuleInit() {
        if (!this.transporter)
            return;
        try {
            await this.transporter.verify();
            this.logger.log('✅ SMTP verified — OTP emails will be delivered.');
        }
        catch (err) {
            this.logger.error(`❌ SMTP verify failed: ${err.message}`, err.stack);
        }
    }
    async sendOtpEmail(email, code) {
        if (!this.transporter) {
            this.logger.warn('SMTP not configured — OTP email skipped.');
            return false;
        }
        try {
            const result = await this.transporter.sendMail({
                from: this.smtpFrom,
                to: email,
                subject: 'Your Novetta verification code',
                text: `Your Novetta OTP is: ${code}\n\nThis code expires in 10 minutes. Do not share it with anyone.`,
                html: this.buildOtpHtml(code),
            });
            this.logger.log(`✅ OTP sent to ${email} — messageId: ${result.messageId}`);
            return true;
        }
        catch (err) {
            this.logger.error(`❌ sendMail failed to ${email}: ${err.message}`, err.stack);
            return false;
        }
    }
    async testSmtp(to) {
        if (!this.transporter) {
            return { ok: false, error: 'Transporter not initialised — check SMTP_USER, SMTP_PASS, SMTP_FROM in .env', smtpUser: this.smtpUser };
        }
        try {
            await this.transporter.verify();
            const result = await this.transporter.sendMail({
                from: this.smtpFrom,
                to,
                subject: 'Novetta — SMTP test ✅',
                text: 'SMTP is working correctly. You will receive OTP emails.',
                html: '<p style="font-family:sans-serif">SMTP is working correctly. You will receive OTP emails from <strong>Novetta</strong>.</p>',
            });
            this.logger.log(`✅ Test email sent to ${to} — messageId: ${result.messageId}`);
            return { ok: true, messageId: result.messageId, smtpUser: this.smtpUser };
        }
        catch (err) {
            this.logger.error(`❌ Test email failed: ${err.message}`);
            return { ok: false, error: err.message, smtpUser: this.smtpUser };
        }
    }
    buildOtpHtml(code) {
        return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;border:1px solid #e0e0e0;overflow:hidden">
        <tr>
          <td style="background:#e40000;padding:24px 32px">
            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:900">novetta</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:32px">
            <p style="margin:0 0 16px;color:#1a1a1a;font-size:15px">Hello,</p>
            <p style="margin:0 0 24px;color:#444;font-size:14px">Use the verification code below to complete your sign-up. This code is valid for <strong>10 minutes</strong>.</p>
            <div style="background:#fff0f0;border:2px dashed #e40000;border-radius:10px;padding:24px;text-align:center;margin:0 0 24px">
              <span style="font-size:40px;font-weight:900;letter-spacing:10px;color:#e40000">${code}</span>
            </div>
            <p style="margin:0;color:#888;font-size:12px">If you did not request this, please ignore this email. Do not share this code with anyone.</p>
          </td>
        </tr>
        <tr>
          <td style="background:#f9f9f9;padding:16px 32px;border-top:1px solid #eee">
            <p style="margin:0;color:#aaa;font-size:11px;text-align:center">© ${new Date().getFullYear()} Novetta Health Pvt. Ltd.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = NotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], NotificationService);
