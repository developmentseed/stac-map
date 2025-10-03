import { useEffect, useMemo, useState } from "react";
import { Box, Container, FileUpload, useFileUpload } from "@chakra-ui/react";
import type { StacCollection, StacItem } from "stac-ts";
import Map from "./components/map";
import Overlay from "./components/overlay";
import { Toaster } from "./components/ui/toaster";
import useStacValue from "./hooks/stac-value";
import type { BBox2D, Color } from "./types/map";
import type { DatetimeBounds, StacValue } from "./types/stac";
import { getItemDatetimes } from "./utils/stac";

// TODO make this configurable by the user.
const lineColor: Color = [207, 63, 2, 100];
const fillColor: Color = [207, 63, 2, 50];

export default function App() {
  // State
  const [href, setHref] = useState<string | undefined>(getInitialHref());
  const fileUpload = useFileUpload({ maxFiles: 1 });
  const [userItems, setItems] = useState<StacItem[]>();
  const [picked, setPicked] = useState<StacValue>();
  const [bbox, setBbox] = useState<BBox2D>();
  const [datetimeBounds, setDatetimeBounds] = useState<DatetimeBounds>();
  const [filter, setFilter] = useState(true);
  const [stacGeoparquetItemId, setStacGeoparquetItemId] = useState<string>();

  // Derived state
  const {
    value,
    error,
    collections,
    catalogs,
    items: linkedItems,
    table,
    stacGeoparquetItem,
  } = useStacValue({
    href,
    fileUpload,
    datetimeBounds: filter ? datetimeBounds : undefined,
    stacGeoparquetItemId,
  });
  const items = userItems || linkedItems;
  const filteredCollections = useMemo(() => {
    if (filter && collections) {
      return collections.filter(
        (collection) =>
          (!bbox || isCollectionInBbox(collection, bbox)) &&
          (!datetimeBounds ||
            isCollectionInDatetimeBounds(collection, datetimeBounds))
      );
    } else {
      return undefined;
    }
  }, [collections, filter, bbox, datetimeBounds]);
  const filteredItems = useMemo(() => {
    if (filter && items) {
      return items.filter(
        (item) =>
          (!bbox || isItemInBbox(item, bbox)) &&
          (!datetimeBounds || isItemInDatetimeBounds(item, datetimeBounds))
      );
    } else {
      return undefined;
    }
  }, [items, filter, bbox, datetimeBounds]);

  // Effects
  useEffect(() => {
    function handlePopState() {
      setHref(new URLSearchParams(location.search).get("href") ?? "");
    }
    window.addEventListener("popstate", handlePopState);

    const href = new URLSearchParams(location.search).get("href");
    if (href) {
      try {
        new URL(href);
      } catch {
        history.pushState(null, "", location.pathname);
      }
    }

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    if (href && new URLSearchParams(location.search).get("href") != href) {
      history.pushState(null, "", "?href=" + href);
    } else if (href === "") {
      history.pushState(null, "", location.pathname);
    }
  }, [href]);

  useEffect(() => {
    // It should never be more than 1.
    if (fileUpload.acceptedFiles.length == 1) {
      setHref(fileUpload.acceptedFiles[0].name);
    }
  }, [fileUpload.acceptedFiles]);

  useEffect(() => {
    setPicked(undefined);
    setItems(undefined);
    setDatetimeBounds(undefined);

    if (value && (value.title || value.id)) {
      document.title = "stac-map | " + (value.title || value.id);
    } else {
      document.title = "stac-map";
    }
  }, [value]);

  useEffect(() => {
    setPicked(stacGeoparquetItem);
  }, [stacGeoparquetItem]);

  return (
    <>
      <Box h={"100dvh"}>
        <FileUpload.RootProvider value={fileUpload} unstyled={true}>
          <FileUpload.Dropzone
            disableClick={true}
            style={{
              height: "100dvh",
              width: "100dvw",
            }}
          >
            <Map
              value={value}
              table={table}
              collections={collections}
              filteredCollections={filteredCollections}
              items={items}
              filteredItems={filteredItems}
              fillColor={fillColor}
              lineColor={lineColor}
              setBbox={setBbox}
              picked={picked}
              setPicked={setPicked}
              setStacGeoparquetItemId={setStacGeoparquetItemId}
            ></Map>
          </FileUpload.Dropzone>
        </FileUpload.RootProvider>
      </Box>
      <Container
        zIndex={1}
        fluid
        h="100dvh"
        pointerEvents={"none"}
        position={"absolute"}
        top={0}
        left={0}
        pt={4}
      >
        <Overlay
          href={href}
          setHref={setHref}
          fileUpload={fileUpload}
          value={value}
          error={error}
          catalogs={catalogs}
          collections={collections}
          filteredCollections={filteredCollections}
          filter={filter}
          setFilter={setFilter}
          bbox={bbox}
          setPicked={setPicked}
          picked={picked}
          items={items}
          filteredItems={filteredItems}
          setItems={setItems}
          setDatetimeBounds={setDatetimeBounds}
        ></Overlay>
      </Container>
      <Toaster></Toaster>
    </>
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

function isCollectionInBbox(collection: StacCollection, bbox: BBox2D) {
  if (bbox[2] - bbox[0] >= 360) {
    // A global bbox always contains every collection
    return true;
  }
  const collectionBbox = collection?.extent?.spatial?.bbox?.[0];
  if (collectionBbox) {
    return (
      !(
        collectionBbox[0] < bbox[0] &&
        collectionBbox[1] < bbox[1] &&
        collectionBbox[2] > bbox[2] &&
        collectionBbox[3] > bbox[3]
      ) &&
      !(
        collectionBbox[0] > bbox[2] ||
        collectionBbox[1] > bbox[3] ||
        collectionBbox[2] < bbox[0] ||
        collectionBbox[3] < bbox[1]
      )
    );
  } else {
    return false;
  }
}

function isCollectionInDatetimeBounds(
  collection: StacCollection,
  bounds: DatetimeBounds
) {
  const interval = collection.extent.temporal.interval[0];
  const start = interval[0] ? new Date(interval[0]) : null;
  const end = interval[1] ? new Date(interval[1]) : null;
  return !((end && end < bounds.start) || (start && start > bounds.end));
}

function isItemInBbox(item: StacItem, bbox: BBox2D) {
  if (bbox[2] - bbox[0] >= 360) {
    // A global bbox always contains every item
    return true;
  }
  const itemBbox = item.bbox;
  if (itemBbox) {
    return (
      !(
        itemBbox[0] < bbox[0] &&
        itemBbox[1] < bbox[1] &&
        itemBbox[2] > bbox[2] &&
        itemBbox[3] > bbox[3]
      ) &&
      !(
        itemBbox[0] > bbox[2] ||
        itemBbox[1] > bbox[3] ||
        itemBbox[2] < bbox[0] ||
        itemBbox[3] < bbox[1]
      )
    );
  } else {
    return false;
  }
}

function isItemInDatetimeBounds(item: StacItem, bounds: DatetimeBounds) {
  const datetimes = getItemDatetimes(item);
  return !(
    (datetimes.end && datetimes.end < bounds.start) ||
    (datetimes.start && datetimes.start > bounds.end)
  );
}
