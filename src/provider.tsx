import { useFileUpload } from "@chakra-ui/react";
import { useEffect, useState, type ReactNode } from "react";
import type { StacItem } from "stac-ts";
import { StacMapContext } from "./context";
import useStacGeoparquet from "./hooks/stac-geoparquet";
import useStacValue from "./hooks/stac-value";
import type { TemporalFilter } from "./types/datetime";
import type { StacSearch } from "./types/stac";

export function StacMapProvider({ children }: { children: ReactNode }) {
  // User-defined state
  const [href, setHref] = useState<string | undefined>(getInitialHref());
  const fileUpload = useFileUpload({ maxFiles: 1 });
  const [temporalFilter, setTemporalFilter] = useState<TemporalFilter>();
  const [search, setSearch] = useState<StacSearch>();
  const [searchItems, setSearchItems] = useState<StacItem[]>();
  const [picked, setPicked] = useState<StacItem>();

  // Derived state
  const {
    value,
    parquetPath,
    root,
    parent,
    catalogs,
    collections,
    items: linkedItems,
  } = useStacValue({ href, fileUpload });
  const {
    table: stacGeoparquetTable,
    metadata: stacGeoparquetMetadata,
    setId: setStacGeoparquetItemId,
    item: stacGeoparquetItem,
  } = useStacGeoparquet(parquetPath, temporalFilter);

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
    if (href && new URLSearchParams(location.search).get("href") != href) {
      history.pushState(null, "", "?href=" + href);
    }
  }, [href]);

  useEffect(() => {
    // It should never be more than 1.
    if (fileUpload.acceptedFiles.length == 1) {
      setHref(fileUpload.acceptedFiles[0].name);
    }
  }, [fileUpload.acceptedFiles]);

  useEffect(() => {
    setPicked(stacGeoparquetItem);
  }, [stacGeoparquetItem]);

  useEffect(() => {
    setSearch(undefined);
  }, [href]);

  useEffect(() => {
    setSearchItems(undefined);
  }, [search]);

  return (
    <StacMapContext.Provider
      value={{
        href,
        setHref,
        search,
        setSearch,
        isStacGeoparquet: !!parquetPath,
        fileUpload,
        value,
        root,
        parent,
        catalogs,
        collections,
        items: searchItems || linkedItems,
        picked,
        setPicked,
        stacGeoparquetTable,
        stacGeoparquetMetadata,
        setStacGeoparquetItemId,
        setTemporalFilter,
        setSearchItems,
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
