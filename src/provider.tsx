import type { UseFileUploadReturn } from "@chakra-ui/react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { StacItem } from "stac-ts";
import { StacMapContext } from "./context";
import useStacGeoparquet from "./hooks/stac-geoparquet";
import { useStacValue } from "./hooks/stac-value";
import type { TemporalFilter } from "./types/datetime";

export function StacMapProvider({
  href,
  fileUpload,
  children,
}: {
  href: string | undefined;
  fileUpload: UseFileUploadReturn;
  children: ReactNode;
}) {
  const [unlinkedItems, setUnlinkedItems] = useState<StacItem[]>();
  const [picked, setPicked] = useState<StacItem>();
  const [temporalFilter, setTemporalFilter] = useState<TemporalFilter>();

  // TODO we should probably consolidate useStacValue and useStacGeoparquet into
  // a single hook, since they're coupled.
  const {
    value,
    parquetPath,
    collections,
    items: linkedItems,
  } = useStacValue({
    href,
    fileUpload,
  });
  const {
    table: stacGeoparquetTable,
    metadata: stacGeoparquetMetadata,
    setId: setStacGeoparquetItemId,
    item: stacGeoparquetItem,
  } = useStacGeoparquet(parquetPath, temporalFilter);

  const items = useMemo(() => {
    return unlinkedItems || linkedItems;
  }, [unlinkedItems, linkedItems]);

  useEffect(() => {
    if (value?.title || value?.id) {
      document.title = "stac-map | " + (value.title || value.id);
    } else {
      document.title = "stac-map";
    }

    setUnlinkedItems(undefined);
    setPicked(undefined);
  }, [value]);

  useEffect(() => {
    setPicked(stacGeoparquetItem);
  }, [stacGeoparquetItem]);

  const filteredItems = useMemo(() => {
    if (items && temporalFilter) {
      return items.filter((item) =>
        isItemWithinTemporalFilter(item, temporalFilter),
      );
    } else {
      return undefined;
    }
  }, [items, temporalFilter]);

  return (
    <StacMapContext.Provider
      value={{
        value,
        collections,
        items,
        setItems: setUnlinkedItems,
        picked,
        setPicked,
        stacGeoparquetTable,
        stacGeoparquetMetadata,
        setStacGeoparquetItemId,
        temporalFilter,
        setTemporalFilter,
        filteredItems,
      }}
    >
      {children}
    </StacMapContext.Provider>
  );
}

function isItemWithinTemporalFilter(
  item: StacItem,
  temporalFilter: TemporalFilter,
) {
  const start = item.properties?.start_datetime
    ? new Date(item.properties.start_datetime)
    : item.properties?.datetime
      ? new Date(item.properties.datetime)
      : null;
  if (!start) {
    return false;
  }
  const end = item.properties?.end_datetime
    ? new Date(item.properties.end_datetime)
    : item.properties?.datetime
      ? new Date(item.properties.datetime)
      : null;
  if (!end) {
    return false;
  }
  return start >= temporalFilter.start && end <= temporalFilter.end;
}
