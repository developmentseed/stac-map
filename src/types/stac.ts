import type {
  StacAsset,
  StacCatalog,
  StacCollection,
  StacItem,
  StacLink,
} from "stac-ts";

/**
 * GeoJSON `FeatureCollection` of STAC Items. This is the shape returned by
 * STAC API `/search` and `/items` endpoints, and is also how stac-map treats a
 * stac-geoparquet file once loaded.
 */
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

/**
 * Anything that can be the top-level `value` driven by the current `href`: a
 * STAC Catalog, Collection, Item, or {@link StacItemCollection}.
 */
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
