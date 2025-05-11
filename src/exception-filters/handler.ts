import { RuntimeException } from "@exceptions/runtime";
import { ArgumentsHost, Catch, Logger, RpcExceptionFilter } from "@nestjs/common";
import { logException } from "@utils/log-exception";
import { Observable, of } from "rxjs";

@Catch(RuntimeException)
export class HandlerExceptionFilter implements RpcExceptionFilter<Error> {

    private readonly logger: Logger = new Logger(HandlerExceptionFilter.name);

    catch(exception: RuntimeException, _host: ArgumentsHost): Observable<any> {
        logException(this.logger, exception);
        return of({});
    }
}