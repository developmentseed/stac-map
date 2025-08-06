import { useFileUpload } from "@chakra-ui/react";
import { useEffect, useState, type ReactNode } from "react";
import type { StacItem } from "stac-ts";
import { StacMapContext } from "./context";
import { useStacCollections } from "./hooks/stac-collections";
import useStacGeoparquet from "./hooks/stac-geoparquet";
import useStacValue from "./hooks/stac-value";

export function StacMapProvider({ children }: { children: ReactNode }) {
  const [href, setHref] = useState<string | undefined>(getInitialHref());
  const fileUpload = useFileUpload({ maxFiles: 1 });
  const { value, parquetPath } = useStacValue(href, fileUpload);
  const collections = useStacCollections(value);
  const [items, setItems] = useState<StacItem[]>();
  const [temporalFilter, setTemporalFilter] = useState<{
    start: Date;
    end: Date;
  }>();
  const {
    table: stacGeoparquetTable,
    metadata: stacGeoparquetMetadata,
    setId: setStacGeoparquetItemId,
    item: stacGeoparquetItem,
  } = useStacGeoparquet(parquetPath, temporalFilter);
  const [picked, setPicked] = useState<StacItem>();
  const [temporalExtents, setTemporalExtents] = useState<{
    start: Date;
    end: Date;
  }>();
  const [filteredItems, setFilteredItems] = useState<StacItem[]>();

  useEffect(() => {
    function handlePopState() {
      setHref(new URLSearchParams(location.search).get("href") ?? "");
    }

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    if (href) {
      if (new URLSearchParams(location.search).get("href") != href) {
        history.pushState(null, "", "?href=" + href);
      }
    }
  }, [href]);

  useEffect(() => {
    // It should never be more than 1.
    if (fileUpload.acceptedFiles.length == 1) {
      setHref(fileUpload.acceptedFiles[0].name);
    }
  }, [fileUpload.acceptedFiles]);

  useEffect(() => {
    setItems(undefined);
    setPicked(undefined);
    setStacGeoparquetItemId(undefined);
    setTemporalExtents(undefined);
    setTemporalFilter(undefined);
  }, [value, setStacGeoparquetItemId]);

  useEffect(() => {
    setPicked(undefined);
  }, [items]);

  useEffect(() => {
    if (items) {
      let start: Date | null = null;
      let end: Date | null = null;
      items.forEach((item) => {
        const { start: itemStart, end: itemEnd } = getStartAndEndDatetime(item);
        if (!start || (itemStart && itemStart < start)) {
          start = itemStart;
        }
        if (!end || (itemEnd && itemEnd > end)) {
          end = itemEnd;
        }
      });
      if (start && end) {
        setTemporalExtents({ start, end });
      }
    }
  }, [items]);

  useEffect(() => {
    if (items) {
      if (temporalFilter) {
        setFilteredItems(
          items.filter((item) => {
            const { start, end } = getStartAndEndDatetime(item);
            return (
              (!start || start >= temporalFilter.start) &&
              (!end || end <= temporalFilter.end)
            );
          }),
        );
      } else {
        setFilteredItems(items);
      }
    } else {
      setFilteredItems(undefined);
    }
  }, [items, temporalFilter]);

  useEffect(() => {
    if (
      stacGeoparquetMetadata?.startDatetime &&
      stacGeoparquetMetadata?.endDatetime
    ) {
      setTemporalExtents({
        start: stacGeoparquetMetadata.startDatetime,
        end: stacGeoparquetMetadata.endDatetime,
      });
    }
  }, [
    stacGeoparquetMetadata?.startDatetime,
    stacGeoparquetMetadata?.endDatetime,
  ]);

  useEffect(() => {
    setPicked(stacGeoparquetItem);
  }, [stacGeoparquetItem]);

  return (
    <StacMapContext.Provider
      value={{
        href,
        setHref,
        fileUpload,
        value,
        collections,
        items,
        setItems,
        picked,
        setPicked,
        stacGeoparquetTable,
        stacGeoparquetMetadata,
        setStacGeoparquetItemId,
        temporalExtents,
        setTemporalFilter,
        filteredItems,
      }}
    >
      {children}
    </StacMapContext.Provider>
  );
}

function getInitialHref() {
  const href = new URLSearchParams(location.search).get("href") || "";
  try {
    new URL(href);
  } catch {
    return undefined;
  }
  return href;
}

function getStartAndEndDatetime(item: StacItem) {
  const startStr = item.properties.start_datetime || item.properties.datetime;
  const start = startStr ? new Date(startStr) : null;
  const endStr = item.properties.end_datetime || item.properties.datetime;
  const end = endStr ? new Date(endStr) : null;
  return { start, end };
}
