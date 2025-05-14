import { RuntimeException } from '@/exceptions/runtime';

export class UnresolvableSocketException extends RuntimeException {
  constructor(public readonly account_id: string) {
    super();
  }
}
