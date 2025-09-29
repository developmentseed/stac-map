import type { StacAsset, StacCatalog, StacCollection, StacItem } from "stac-ts";

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
}

export interface NaturalLanguageCollectionSearchResult {
  collection_id: string;
  explanation: string;
}

export type StacAssets = { [k: string]: StacAsset };

export interface StacSearch {
  collections?: string[];
  datetime?: string;
  bbox?: number[];
}

export type DatetimeBounds = { start: Date; end: Date };
