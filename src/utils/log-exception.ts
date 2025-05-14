import { AccountOfflineException } from '@/exceptions/account-offline';
import { EmptyCommandArgumentException } from '@/exceptions/empty-command-argument';
import { EmptyCommentException } from '@/exceptions/empty-comment';
import { MaximumRequestsReachedException } from '@/exceptions/maximum-requests-reached';
import { RuntimeException } from '@/exceptions/runtime';
import { UnresolvableAccountException } from '@/exceptions/unresolvable-account';
import { UnresolvableLiveException } from '@/exceptions/unresolvable-live';
import { UnresolvableSocketException } from '@/exceptions/unresolvable-socket';
import { Logger } from '@nestjs/common';

export function logException(logger: Logger, exception: Error) {
  if (exception instanceof AccountOfflineException) {
    const runtime_exception = exception as AccountOfflineException;
    logger.warn(
      `LIVE ${runtime_exception.stream_id} from ${runtime_exception.owner_username} is offline in database`,
    );
  } else if (exception instanceof EmptyCommandArgumentException) {
    const runtime_exception = exception as EmptyCommandArgumentException;
    logger.warn(
      `No command arguments were given by ${runtime_exception.user_username} in LIVE ${runtime_exception.stream_id} from ${runtime_exception.owner_username}`,
    );
  } else if (exception instanceof EmptyCommentException) {
    logger.warn(`Empty command`);
  } else if (exception instanceof MaximumRequestsReachedException) {
    logger.warn(`Maximum reached`);
  } else if (exception instanceof UnresolvableAccountException) {
    const runtime_exception = exception as UnresolvableAccountException;
    logger.warn(
      `Unresolvable ${runtime_exception.owner_username} account in database`,
    );
  } else if (exception instanceof UnresolvableLiveException) {
    const runtime_exception = exception as UnresolvableLiveException;
    logger.warn(
      `Unresolvable ${runtime_exception.stream_id} LIVE from ${runtime_exception.owner_username} in database`,
    );
  } else if (exception instanceof UnresolvableSocketException) {
    const runtime_exception = exception as UnresolvableSocketException;
    logger.warn(`Unresolvable socket for ${runtime_exception.account_id}`);
  } else if (exception instanceof RuntimeException) {
    logger.error(`Unexpected runtime exception caught: ${exception.message}`);
    logger.error(exception.stack);
  } else {
    logger.fatal(`Unknown error caught: ${exception.message}`);
    logger.fatal(exception.stack);
  }
}
