// Enums
import { CacheKey } from "@enums/cache-key";
import { FeatureType } from "@enums/feature-type";

export class CacheUtils {

    static ACCOUNTS_KEY(): string {
        return CacheKey.ACCOUNTS;
    }

    static FEATURE_KEY(account_id: string, type: FeatureType): string {
        return `${CacheKey.FEATURE}_${type}_${account_id}`;
    }
}