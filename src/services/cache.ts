// NestJS
import { Inject, Injectable } from "@nestjs/common";
import { Cache, CACHE_MANAGER } from "@nestjs/cache-manager";

// Interfaces
import { IAccount } from "@interfaces/account";
import { IFeature } from "@interfaces/feature";

// Enums
import { FeatureType } from "@enums/feature-type";

// Utils
import { CacheUtils } from "@utils/cache-utils";

@Injectable()
export class CacheService {

    constructor (@Inject(CACHE_MANAGER) private cache_manager: Cache) {}

    async setAccounts(accounts: IAccount[]): Promise<void> {
        await this.cache_manager.set<IAccount[]>(CacheUtils.ACCOUNTS_KEY(), accounts);
    }

    async getAccounts(): Promise<IAccount[] | null> {
        return this.cache_manager.get<IAccount[]>(CacheUtils.ACCOUNTS_KEY());
    }

    async setFeature(account_id: string, type: FeatureType, feature: IFeature): Promise<void> {
        await this.cache_manager.set(CacheUtils.FEATURE_KEY(account_id, type), feature);
    }

    async getFeature(account_id: string, type: FeatureType): Promise<IFeature | null> {
        return this.cache_manager.get(CacheUtils.FEATURE_KEY(account_id, type));
    }
}