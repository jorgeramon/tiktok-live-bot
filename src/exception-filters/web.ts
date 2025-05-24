import { RuntimeException } from '@/exceptions/runtime';
import { logException } from '@/utils/log-exception';
import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { Response } from 'express';

@Catch(RuntimeException)
export class WebExceptionFilter implements ExceptionFilter<Error> {
  private readonly logger: Logger = new Logger(WebExceptionFilter.name);

  catch(exception: RuntimeException, host: ArgumentsHost): void {
    logException(this.logger, exception);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(401).json({
      unathorized: true,
    });
  }
}
