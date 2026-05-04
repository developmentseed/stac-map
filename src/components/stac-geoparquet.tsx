import { useStacGeoparquetTable } from "@/hooks/stac";
import { useStore } from "@/store";
import type { SupportedGeometryType } from "@/utils/stac-geoparquet";
import type { AsyncDuckDBConnection } from "@duckdb/duckdb-wasm";
import {
  GeoArrowPathLayer,
  GeoArrowPolygonLayer,
  GeoArrowScatterplotLayer,
} from "@geoarrow/deck.gl-layers";
import type { Table } from "apache-arrow";
import { useEffect } from "react";
import { ErrorAlert } from "./ui/error-alert";

export default function StacGeoparquet({
  href,
  connection,
}: {
  href: string;
  connection: AsyncDuckDBConnection;
}) {
  const result = useStacGeoparquetTable({ href, connection });
  if (result.error)
    return <ErrorAlert title="stac-geoparquet" error={result.error} />;
  if (!result.data?.table || !result.data.geometryType) return null;
  return (
    <StacGeoparquetTable
      table={result.data.table}
      geometryType={result.data.geometryType}
    />
  );
}

function StacGeoparquetTable({
  table,
  geometryType,
}: {
  table: Table;
  geometryType: SupportedGeometryType;
}) {
  switch (geometryType) {
    case "point":
      return <StacGeoparquetPoints table={table} />;
    case "polygon":
      return <StacGeoparquetPolygons table={table} />;
    case "linestring":
      return <StacGeoparquetLinestrings table={table} />;
    default:
      return null;
  }
}

function StacGeoparquetPoints({ table }: { table: Table }) {
  const setLayer = useStore((store) => store.setLayer);
  const lineColor = useStore((store) => store.lineColor);

  useEffect(() => {
    setLayer(
      "stac-geoparquet-point",
      new GeoArrowScatterplotLayer({
        id: "stac-geoparquet-point",
        data: table,
        getColor: lineColor,
        getRadius: 2,
        getPosition: table.getChild("geometry")!,
        radiusUnits: "pixels",
        pickable: true,
      })
    );

    return () => {
      setLayer("stac-geoparquet-point", undefined);
    };
  }, [table, setLayer, lineColor]);

  return null;
}

function StacGeoparquetPolygons({ table }: { table: Table }) {
  const setLayer = useStore((store) => store.setLayer);
  const lineColor = useStore((store) => store.lineColor);

  useEffect(() => {
    setLayer(
      "stac-geoparquet-polygon",
      new GeoArrowPolygonLayer({
        id: "stac-geoparquet-polygon",
        data: table,
        getFillColor: lineColor,
        getPosition: table.getChild("geometry")!,
        pickable: true,
      })
    );

    return () => {
      setLayer("stac-geoparquet-polygon", undefined);
    };
  }, [table, setLayer, lineColor]);

  return null;
}

function StacGeoparquetLinestrings({ table }: { table: Table }) {
  const setLayer = useStore((store) => store.setLayer);
  const lineColor = useStore((store) => store.lineColor);

  useEffect(() => {
    setLayer(
      "stac-geoparquet-linestring",
      new GeoArrowPathLayer({
        id: "stac-geoparquet-linestring",
        data: table,
        getColor: lineColor,
        getPosition: table.getChild("geometry")!,
        pickable: true,
      })
    );

    return () => {
      setLayer("stac-geoparquet-linestring", undefined);
    };
  }, [table, setLayer, lineColor]);

  return null;
}
