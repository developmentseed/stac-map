import { useStore } from "@/store";
import { loadGeoTIFF } from "@/utils/geotiff";
import {
  computeBandRangeFromOverview,
  isSingleBandGreyscale,
  resolveBandRange,
  type BandRange,
} from "@/utils/single-band";
import {
  fetchStacGeoparquetItem,
  fetchStacGeoparquetTable,
  fetchStacGeoparquetValue,
} from "@/utils/stac-geoparquet";
import type { GeoTIFF } from "@developmentseed/geotiff";
import type { AsyncDuckDBConnection } from "@duckdb/duckdb-wasm";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type { StacAsset } from "stac-ts";
import { fetchStacValue } from "../utils/stac";

export function useStacValue({ href }: { href: string }) {
  const uploadedFile = useStore((store) => store.uploadedFile);
  return useQuery({
    queryKey: ["stac-value", href],
    queryFn: async () => fetchStacValue({ href, uploadedFile }),
  });
}

export function useStacGeoparquetValue({
  href,
  connection,
}: {
  href: string;
  connection: AsyncDuckDBConnection;
}) {
  const hivePartitioning = useStore((store) => store.hivePartitioning);
  return useQuery({
    queryKey: ["stac-geoparquet-value", href],
    queryFn: async () =>
      fetchStacGeoparquetValue({ href, connection, hivePartitioning }),
  });
}

export function useStacGeoparquetTable({
  href,
  connection,
  where,
}: {
  href: string;
  connection: AsyncDuckDBConnection;
  where?: string;
}) {
  const hivePartitioning = useStore((store) => store.hivePartitioning);
  return useQuery({
    queryKey: ["stac-geoparquet-table", href, where ?? null],
    queryFn: async () =>
      fetchStacGeoparquetTable({ href, connection, hivePartitioning, where }),
  });
}

export function useStacGeoparquetItem({
  href,
  connection,
  id,
}: {
  href: string;
  connection: AsyncDuckDBConnection;
  id: string;
}) {
  const hivePartitioning = useStore((store) => store.hivePartitioning);
  return useQuery({
    queryKey: ["stac-geoparquet-item", href, id],
    queryFn: async () =>
      fetchStacGeoparquetItem({ href, connection, hivePartitioning, id }),
  });
}

export function useGeoTIFF(href: string | undefined) {
  return useQuery({
    queryKey: ["geotiff", href],
    queryFn: async () => loadGeoTIFF(href!),
    enabled: !!href,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

export function useGeoTIFFBandRange({
  href,
  geotiff,
  asset,
}: {
  href: string | undefined;
  geotiff: GeoTIFF | undefined;
  asset: StacAsset | undefined;
}): BandRange | undefined {
  const sync = geotiff ? resolveBandRange(asset, geotiff) : undefined;
  const query = useQuery({
    queryKey: ["geotiff-band-range", href],
    queryFn: async ({ signal }) =>
      (await computeBandRangeFromOverview(geotiff!, signal)) ?? null,
    enabled: !!geotiff && !!href && !sync && isSingleBandGreyscale(geotiff),
    staleTime: Infinity,
    gcTime: Infinity,
  });
  const raw = sync ?? query.data ?? undefined;
  return useMemo(
    () => (raw ? { min: raw.min, max: raw.max } : undefined),
    // Key on the primitive min/max so an unchanged range keeps a stable object
    // reference; `raw` itself churns because `resolveBandRange` returns a fresh
    // object each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [raw?.min, raw?.max]
  );
}
