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

export interface NaturalLanguageCollectionSearchResult {
  collection_id: string;
  explanation: string;
}

export type StacAssets = { [k: string]: StacAsset };

export interface StacSearch {
  collections: string[];
  bbox?: [number, number, number, number];
  datetime?: string;
  limit?: number;
}

export type DatetimeBounds = { start: Date | null; end: Date | null };

export interface AlternateAsset {
  href: string;
  title?: string;
}

export interface Band {
  name?: string;
  common_name?: string;
  description?: string;
}

export interface AssetWithAlternates extends StacAsset {
  alternate?: { [key: string]: AlternateAsset };
  bands?: Band[];
  "eo:bands"?: Band[];
}
