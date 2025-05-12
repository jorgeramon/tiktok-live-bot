// Enums
import { CacheKey } from "@enums/cache-key";

export class CacheUtils {

    static ACCOUNTS_KEY(): string {
        return CacheKey.ACCOUNTS;
    }

    static SOCKET_KEY(account_id: string) {
        return `${CacheKey.SOCKETS}.${account_id}`;
    }
}