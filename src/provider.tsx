import { useFileUpload } from "@chakra-ui/react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { StacCatalog, StacCollection, StacItem } from "stac-ts";
import { StacMapContext } from "./context";
import useStacChildrenAndItems from "./hooks/stac-children-and-items";
import useStacGeoparquet from "./hooks/stac-geoparquet";
import useStacValue from "./hooks/stac-value";

export function StacMapProvider({ children }: { children: ReactNode }) {
  const [href, setHref] = useState<string | undefined>(getInitialHref());
  const fileUpload = useFileUpload({ maxFiles: 1 });
  const { value, parquetPath } = useStacValue(href, fileUpload);
  const { value: root } = useStacValue(
    value && value.links?.find((l) => l.rel === "root")?.href,
    undefined,
    ["Catalog", "Collection"],
  );
  const { value: parent } = useStacValue(
    value && value.links?.find((l) => l.rel === "parent")?.href,
    undefined,
    ["Catalog", "Collection"],
  );
  const {
    catalogs,
    collections,
    isFetchingCollections,
    items: linkedItems,
  } = useStacChildrenAndItems(value, href);
  const [searchItems, setSearchItems] = useState<StacItem[]>();
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
  const items = searchItems || linkedItems;

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
    // controls when to clear search items
    const shouldClearSearch =
      value?.type === "Catalog" ||
      (value?.type === "Collection" &&
        searchItems &&
        searchItems.length > 0 &&
        searchItems[0].collection !== value.id);

    if (shouldClearSearch) {
      setSearchItems(undefined);
    }
    setPicked(undefined);
    setStacGeoparquetItemId(undefined);
    setTemporalFilter(undefined);
  }, [value, setStacGeoparquetItemId, searchItems]);

  useEffect(() => {
    setPicked(stacGeoparquetItem);
  }, [stacGeoparquetItem]);

  const temporalExtents = useMemo(() => {
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
      // @ts-expect-error Don't know why start and end are never.
      if (start && end && start.getTime() != end.getTime()) {
        return { start, end };
      }
    } else if (
      stacGeoparquetMetadata?.startDatetime &&
      stacGeoparquetMetadata?.endDatetime
    ) {
      return {
        start: stacGeoparquetMetadata.startDatetime,
        end: stacGeoparquetMetadata.endDatetime,
      };
    }
  }, [
    items,
    stacGeoparquetMetadata?.startDatetime,
    stacGeoparquetMetadata?.endDatetime,
  ]);

  const filteredItems = useMemo(() => {
    return (
      items?.filter((item) => {
        if (temporalFilter) {
          const { start, end } = getStartAndEndDatetime(item);
          return (
            (!start || start >= temporalFilter.start) &&
            (!end || end <= temporalFilter.end)
          );
        } else {
          return true;
        }
      }) || []
    );
  }, [items, temporalFilter]);

  return (
    <StacMapContext.Provider
      value={{
        href,
        setHref,
        isStacGeoparquet: !!parquetPath,
        fileUpload,
        value,
        parent: parent as StacCatalog | StacCollection | undefined,
        root: root as StacCatalog | StacCollection | undefined,
        catalogs,
        collections,
        isFetchingCollections,
        items,
        setItems: setSearchItems,
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
