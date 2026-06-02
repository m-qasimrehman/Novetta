import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common'

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter')

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    const isDev = process.env.NODE_ENV !== 'production'

    if (exception instanceof HttpException) {
      const status = exception.getStatus()
      const res = exception.getResponse()
      // res is either a string or a NestJS error object {statusCode, message, error}
      const message = typeof res === 'string' ? res : (res as any).message ?? 'An error occurred'
      const errors = Array.isArray(message) ? message : []
      const displayMessage = Array.isArray(message) ? message[0] : message
      response.status(status).json({ success: false, message: displayMessage, errors })
    } else {
      const err = exception as Error
      this.logger.error(`Unhandled exception: ${err.message}`, err.stack)
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: isDev ? err.message : 'Internal server error',
        errors: isDev ? [err.stack] : [],
      })
    }
  }
}
