import {
  useStacGeoparquetBboxType,
  useStacGeoparquetTable,
  useStacGeoparquetValue,
} from "@/hooks/stac";
import { useStore } from "@/store";
import { normalizeViewport } from "@/utils/bbox";
import { getPaddedViewportBbox } from "@/utils/map";
import {
  bboxWhereClause,
  type SupportedGeometryType,
} from "@/utils/stac-geoparquet";
import {
  Alert,
  Button,
  ButtonGroup,
  IconButton,
  Progress,
} from "@chakra-ui/react";
import type { Color } from "@deck.gl/core";
import type { AsyncDuckDBConnection } from "@duckdb/duckdb-wasm";
import {
  GeoArrowPathLayer,
  GeoArrowPolygonLayer,
  GeoArrowScatterplotLayer,
} from "@geoarrow/deck.gl-layers";
import type { Table } from "apache-arrow";
import { useEffect, useMemo, useState } from "react";
import { LuFrame, LuX } from "react-icons/lu";
import { useMap } from "react-map-gl/maplibre";
import { BboxLayer } from "./bbox-layer";
import { ErrorAlert } from "./ui/error-alert";
import { StacGeoparquetLimitInput } from "./ui/stac-geoparquet-limit-input";

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

  const bbox = useStore((store) => store.stacGeoparquetBbox);
  const bboxType = useStacGeoparquetBboxType({ href, connection });
  const viewport = useMemo(() => bbox && normalizeViewport(bbox), [bbox]);

  const where = useMemo(() => {
    const clauses = [];
    if (datetimeFilter) {
      const start = new Date(datetimeFilter[0]).toISOString();
      const end = new Date(datetimeFilter[1]).toISOString();
      clauses.push(
        `datetime BETWEEN TIMESTAMP '${start}' AND TIMESTAMP '${end}'`
      );
    }
    if (viewport && bboxType.isSuccess) {
      clauses.push(bboxWhereClause(bboxType.data, viewport));
    }
    return clauses.length > 0 ? clauses.join(" AND ") : undefined;
  }, [datetimeFilter, viewport, bboxType.isSuccess, bboxType.data]);

  const result = useStacGeoparquetTable({
    href,
    connection,
    where,
    enabled: !viewport || !bboxType.isPending,
  });
  if (result.error)
    return <ErrorAlert title="stac-geoparquet" error={result.error} />;
  return (
    <>
      {result.isFetching && <StacGeoparquetProgress />}
      {(result.data?.truncated || bbox) && (
        <StacGeoparquetLimitNotice truncated={!!result.data?.truncated} />
      )}
      {bbox && <BboxLayer id="stac-geoparquet-bbox" bbox={bbox} />}
      {result.data?.table && result.data.geometryType && (
        <StacGeoparquetTable
          table={result.data.table}
          geometryType={result.data.geometryType}
        />
      )}
    </>
  );
}

function StacGeoparquetProgress() {
  return (
    <Progress.Root value={null} size={"xs"}>
      <Progress.Label mb={2} fontSize={"sm"} fontWeight={"normal"}>
        Loading items…
      </Progress.Label>
      <Progress.Track>
        <Progress.Range />
      </Progress.Track>
    </Progress.Root>
  );
}

function StacGeoparquetLimitNotice({ truncated }: { truncated: boolean }) {
  const limit = useStore((store) => store.stacGeoparquetLimit);
  const bbox = useStore((store) => store.stacGeoparquetBbox);
  const setBbox = useStore((store) => store.setStacGeoparquetBbox);
  const { map } = useMap();
  const items = `item${limit === 1 ? "" : "s"}`;
  const title = truncated
    ? `Showing the first ${limit.toLocaleString()} ${items}${bbox ? " in the viewport" : ""}`
    : "Showing all items in the viewport";

  return (
    <Alert.Root status="info" size={"sm"}>
      <Alert.Indicator />
      <Alert.Content gap={2}>
        <Alert.Title>{title}</Alert.Title>
        <Alert.Description>
          Adjust the item limit, or only load items within the map viewport.
        </Alert.Description>
        <StacGeoparquetLimitInput />
        <ButtonGroup size={"sm"} variant={"outline"} attached>
          <Button
            disabled={!map}
            onClick={() => map && setBbox(getPaddedViewportBbox(map))}
          >
            <LuFrame /> Load items in viewport
          </Button>
          {bbox && (
            <IconButton
              aria-label={"Clear viewport"}
              onClick={() => setBbox(null)}
            >
              <LuX />
            </IconButton>
          )}
        </ButtonGroup>
      </Alert.Content>
    </Alert.Root>
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
      case "multipolygon":
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
