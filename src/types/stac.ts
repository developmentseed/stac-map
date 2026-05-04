import type {
  StacAsset,
  StacCatalog,
  StacCollection,
  StacItem,
  StacLink,
} from "stac-ts";

export interface StacItemCollection {
  type: "FeatureCollection";
  features: StacItem[];
  id?: string;
  title?: string;
  description?: string;
  links?: StacLink[];
  numberMatched?: number;
  [k: string]: unknown;
}

export type StacValue =
  | StacCatalog
  | StacCollection
  | StacItem
  | StacItemCollection;

export interface StacCollections {
  collections: StacCollection[];
  links?: StacLink[];
  numberMatched?: number;
}

export type StacAssets = { [k: string]: StacAsset };
