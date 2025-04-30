// Enums
import { FeatureType } from "@enums/feature-type";

export interface IQueueFeature {
    prefix: string | null;
    add_variants: string[];
}

export interface IFeature {
    account_id: string;
    type: FeatureType;
    enabled: boolean;
    config: IQueueFeature | null;
}