import { RuntimeException } from '@/exceptions/runtime';
import { logException } from '@/utils/log-exception';
import {
  ArgumentsHost,
  Catch,
  Logger,
  RpcExceptionFilter,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';

@Catch(RuntimeException)
export class RcpExceptionFilter implements RpcExceptionFilter<Error> {
  private readonly logger: Logger = new Logger(RcpExceptionFilter.name);

  catch(exception: RuntimeException, _host: ArgumentsHost): Observable<any> {
    logException(this.logger, exception);
    return of({});
  }
}
