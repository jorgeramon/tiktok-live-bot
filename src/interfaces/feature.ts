// Enums
import { FeatureType } from "@enums/feature-type";

export interface IRequestFeature {
    prefix: string | null;
    add_variants: string[];
}

export interface IFeature {
    account_id: string;
    type: FeatureType;
    enabled: boolean;
    config: IRequestFeature | null;
}