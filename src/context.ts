import type { Table } from "apache-arrow";
import { createContext } from "react";
import type { StacCollection, StacItem } from "stac-ts";
import type { StacGeoparquetMetadata, StacValue } from "./types/stac";

export const StacMapContext = createContext<StacMapContextType | null>(null);

/// To keep things simple, this state should only hold things the need to be
/// shared with the map.
interface StacMapContextType {
  /// The root STAC value.
  value: StacValue | undefined;

  /// Collections either loaded from the collections endpoint or linked from the value.
  collections: StacCollection[] | undefined;

  /// STAC items linked form the value.
  linkedItems: StacItem[] | undefined;

  /// STAC items for visualization, often from search.
  items: StacItem[] | undefined;

  /// Set the items.
  setItems: (items: StacItem[] | undefined) => void;

  /// The stac-geoparquet table that's currently loaded.
  stacGeoparquetTable: Table | undefined | null;

  /// The stac-geoparquet metadata.
  stacGeoparquetMetadata: StacGeoparquetMetadata | undefined;

  /// Set the id of a stac-geoparquet item that should be fetched from the
  /// parquet table and loaded into the picked item.
  setStacGeoparquetItemId: (id: string | undefined) => void;

  /// A picked item.
  ///
  /// "picking" usually involves clicking on the map.
  picked: StacItem | undefined;

  /// Set the picked item.
  setPicked: (value: StacItem | undefined) => void;
}
