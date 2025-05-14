import { RuntimeException } from '@/exceptions/runtime';

export class UnresolvableLiveException extends RuntimeException {
  constructor(
    public readonly owner_username: string,
    public readonly stream_id: string,
  ) {
    super();
  }
}
