import type { UseFileUploadReturn } from "@chakra-ui/react";
import type { Table } from "apache-arrow";
import { createContext } from "react";
import type { StacCatalog, StacCollection, StacItem } from "stac-ts";
import type {
  StacContainer,
  StacGeoparquetMetadata,
  StacSearch,
  StacValue,
} from "./types/stac";

export const StacMapContext = createContext<StacMapContextType | null>(null);

interface StacMapContextType {
  /// A function to set the href.
  setHref: (href: string | undefined) => void;

  /// A shared fileUpload structure that is the source of JSON or
  /// stac-geoparquet bytes.
  fileUpload: UseFileUploadReturn;

  /// Set the STAC search.
  setSearch: (search: StacSearch | undefined) => void;

  /// Set the picked item.
  setPicked: (value: StacItem | undefined) => void;

  /// Set the id of a stac-geoparquet item that should be fetched from the
  /// parquet table and loaded into the picked item.
  setStacGeoparquetItemId: (id: string | undefined) => void;

  /// Set the searched items.
  setSearchItems: (items: StacItem[] | undefined) => void;

  /// Sets the temporal filter.
  setTemporalFilter: (
    temporalFilter: { start: Date; end: Date } | undefined,
  ) => void;

  /// The root href for the app, used to load `value`.
  ///
  /// This is sync'd with a url parameter.
  href: string | undefined;

  /// Is the current value stac-geoparquet?
  isStacGeoparquet: boolean;

  /// The root STAC value.
  value: StacValue | undefined;

  /// The root of the STAC value.
  root: StacContainer | undefined;

  /// The parent of the STAC value.
  parent: StacContainer | undefined;

  /// Any catalogs linked from the value.
  catalogs: StacCatalog[];

  /// Collections either loaded from the collections endpoint or linked from the value.
  collections: StacCollection[];

  /// STAC items for visualization.
  items: StacItem[] | undefined;

  /// The stac-geoparquet table that's currently loaded.
  stacGeoparquetTable: Table | undefined | null;

  /// The stac-geoparquet metadata that are currently loaded.
  stacGeoparquetMetadata: StacGeoparquetMetadata | undefined;

  /// A picked item.
  ///
  /// "picking" usually involves clicking on the map.
  picked: StacItem | undefined;

  /// The active STAC search.
  search: StacSearch | undefined;
}
