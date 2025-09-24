import type { UseFileUploadReturn } from "@chakra-ui/react";
import { useEffect, useState, type ReactNode } from "react";
import type { StacItem } from "stac-ts";
import { StacMapContext } from "./context";
import useStacGeoparquet from "./hooks/stac-geoparquet";
import { useStacValue } from "./hooks/stac-value";
import type { TemporalFilter } from "./types/datetime";

export function StacMapProvider({
  href,
  fileUpload,
  temporalFilter,
  children,
}: {
  href: string | undefined;
  fileUpload: UseFileUploadReturn;
  temporalFilter: TemporalFilter | undefined;
  children: ReactNode;
}) {
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
  const [items, setItems] = useState<StacItem[]>();
  const [picked, setPicked] = useState<StacItem>();

  useEffect(() => {
    if (value?.title || value?.id) {
      document.title = "stac-map | " + (value.title || value.id);
    } else {
      document.title = "stac-map";
    }

    setItems(undefined);
    setPicked(undefined);
  }, [value]);

  useEffect(() => {
    setPicked(stacGeoparquetItem);
  }, [stacGeoparquetItem]);

  return (
    <StacMapContext.Provider
      value={{
        value,
        collections,
        linkedItems,
        items,
        setItems,
        picked,
        setPicked,
        stacGeoparquetTable,
        stacGeoparquetMetadata,
        setStacGeoparquetItemId,
      }}
    >
      {children}
    </StacMapContext.Provider>
  );
}
