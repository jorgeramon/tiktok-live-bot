// NestJS
import { Inject, Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";

// Interfaces
import { IAccount } from "@interfaces/account";
import { IFeature } from "@interfaces/feature";

// Repositories
import { AccountRepository } from "@repositories/account";
import { FeatureRepository } from "@repositories/feature";

// Local
import { CacheService } from "./cache";

@Injectable()
export class Setup implements OnApplicationBootstrap {

    private readonly logger: Logger = new Logger(Setup.name);

    constructor (
        private readonly cache_service: CacheService,
        private readonly account_repository: AccountRepository,
        private readonly feature_repository: FeatureRepository
    ) {}

    async onApplicationBootstrap() {
        await this.cacheAccounts();
        await this.cacheFeatures();
    }

    private async cacheAccounts(): Promise<void> {
        this.logger.debug('Caching accounts...');
        const accounts: IAccount[] = await this.account_repository.findAll();
        await this.cache_service.setAccounts(accounts);
    }

    private async cacheFeatures(): Promise<void> {
        this.logger.debug('Caching features...');
        const features: IFeature[] = await this.feature_repository.findAll();
        await Promise.all(features.map(feature => this.cache_service.setFeature(feature.account_id, feature.type, feature)));
    }
}