import { useStacGeoparquetTable, useStacGeoparquetValue } from "@/hooks/stac";
import { useStore } from "@/store";
import type { SupportedGeometryType } from "@/utils/stac-geoparquet";
import type { Color } from "@deck.gl/core";
import type { AsyncDuckDBConnection } from "@duckdb/duckdb-wasm";
import {
  GeoArrowPathLayer,
  GeoArrowPolygonLayer,
  GeoArrowScatterplotLayer,
} from "@geoarrow/deck.gl-layers";
import type { Table } from "apache-arrow";
import { useEffect, useMemo, useState } from "react";
import { ErrorAlert } from "./ui/error-alert";

export default function StacGeoparquet({
  href,
  connection,
}: {
  href: string;
  connection: AsyncDuckDBConnection;
}) {
  const datetimeFilter = useStore((store) => store.datetimeFilters[href]);
  const setDatetimeExtent = useStore((store) => store.setDatetimeExtent);
  const summary = useStacGeoparquetValue({ href, connection });
  const datetimeExtent = summary.data?.datetimeExtent as
    [number, number] | null | undefined;

  useEffect(() => {
    setDatetimeExtent("geoparquet", datetimeExtent ?? null);
    return () => setDatetimeExtent("geoparquet", null);
  }, [datetimeExtent, setDatetimeExtent]);

  const where = useMemo(() => {
    if (!datetimeFilter) return undefined;
    const start = new Date(datetimeFilter[0]).toISOString();
    const end = new Date(datetimeFilter[1]).toISOString();
    return `datetime BETWEEN TIMESTAMP '${start}' AND TIMESTAMP '${end}'`;
  }, [datetimeFilter]);

  const result = useStacGeoparquetTable({ href, connection, where });
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
  const [hovered, setHovered] = useState<string>();
  const setStacGeoparquetId = useStore((store) => store.setStacGeoparquetId);
  const setLayer = useStore((store) => store.setLayer);
  const lineColor = useStore((store) => store.lineColor);
  const fillColor = useStore((store) => store.fillColor);
  const id = `stac-geoparquet-${geometryType}`;

  const layer = useMemo(() => {
    switch (geometryType) {
      case "point":
        return new GeoArrowScatterplotLayer({
          id,
          data: table,
          getColor: lineColor,
          getRadius: 2,
          getPosition: table.getChild("geometry")!,
          radiusUnits: "pixels",
          pickable: true,
          onHover: (info) => {
            setHovered(info.object?.id);
          },
          onClick: (info) => {
            setStacGeoparquetId(info.object?.id);
          },
        });
      case "polygon":
        return new GeoArrowPolygonLayer({
          id,
          data: table,
          filled: true,
          getFillColor: ({ index, data }) => {
            const id = data.data.get(index)?.["id"];
            return id === hovered ? fillColor : ([0, 0, 0, 0] as Color);
          },
          getLineColor: lineColor,
          getLineWidth: 2,
          lineWidthUnits: "pixels",
          pickable: true,
          onHover: (info) => {
            setHovered(info.object?.id);
          },
          onClick: (info) => {
            setStacGeoparquetId(info.object?.id);
          },
          updateTriggers: {
            getFillColor: [hovered],
          },
        });
      case "linestring":
        return new GeoArrowPathLayer({
          id,
          data: table,
          getColor: lineColor,
          getWidth: 4,
          widthUnits: "pixels",
          pickable: true,
          onHover: (info) => {
            setHovered(info.object?.id);
          },
          onClick: (info) => {
            setStacGeoparquetId(info.object?.id);
          },
        });
      default:
        return null;
    }
  }, [
    id,
    geometryType,
    table,
    lineColor,
    fillColor,
    hovered,
    setStacGeoparquetId,
  ]);

  useEffect(() => {
    if (!layer) return;
    setLayer(id, layer);
    return () => setLayer(id, undefined);
  }, [id, layer, setLayer]);

  return null;
}
