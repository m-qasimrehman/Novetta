"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
let HttpExceptionFilter = class HttpExceptionFilter {
    logger = new common_1.Logger('ExceptionFilter');
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const isDev = process.env.NODE_ENV !== 'production';
        if (exception instanceof common_1.HttpException) {
            const status = exception.getStatus();
            const res = exception.getResponse();
            // res is either a string or a NestJS error object {statusCode, message, error}
            const message = typeof res === 'string' ? res : res.message ?? 'An error occurred';
            const errors = Array.isArray(message) ? message : [];
            const displayMessage = Array.isArray(message) ? message[0] : message;
            response.status(status).json({ success: false, message: displayMessage, errors });
        }
        else {
            const err = exception;
            this.logger.error(`Unhandled exception: ${err.message}`, err.stack);
            response.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: isDev ? err.message : 'Internal server error',
                errors: isDev ? [err.stack] : [],
            });
        }
    }
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = __decorate([
    (0, common_1.Catch)()
], HttpExceptionFilter);
