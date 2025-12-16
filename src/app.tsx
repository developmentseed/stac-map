import { useEffect, useMemo, useState } from "react";
import { Box, Container, FileUpload, useFileUpload } from "@chakra-ui/react";
import type { StacCollection, StacItem } from "stac-ts";
import { Toaster } from "./components/ui/toaster";
import useHrefParam from "./hooks/href-param";
import useStacChildren from "./hooks/stac-children";
import useStacFilters from "./hooks/stac-filters";
import useStacValue from "./hooks/stac-value";
import Map from "./layers/map";
import Overlay from "./layers/overlay";
import type { BBox2D, Color } from "./types/map";
import type { DatetimeBounds, StacValue } from "./types/stac";
import getDateTimes from "./utils/datetimes";
import { getCogTileHref } from "./utils/stac";
import getDocumentTitle from "./utils/title";

// TODO make this configurable by the user.
const lineColor: Color = [207, 63, 2, 100];
const fillColor: Color = [207, 63, 2, 50];

export default function App() {
  // User state
  const { href, setHref } = useHrefParam();
  const fileUpload = useFileUpload({
    maxFiles: 1,
    onFileChange: (details) => {
      if (details.acceptedFiles.length === 1) {
        setHref(details.acceptedFiles[0].name);
      }
    },
  });
  const [userCollections, setCollections] = useState<StacCollection[]>();
  const [userItems, setItems] = useState<StacItem[]>();
  const [picked, setPicked] = useState<StacValue>();
  const [bbox, setBbox] = useState<BBox2D>();
  const [datetimeBounds, setDatetimeBounds] = useState<DatetimeBounds>();
  const [filter, setFilter] = useState(true);
  const [stacGeoparquetItemId, setStacGeoparquetItemId] = useState<string>();
  const [cogTileHref, setCogTileHref] = useState<string>();

  // Derived state
  const {
    value,
    error,
    items: linkedItems,
    table,
    stacGeoparquetItem,
  } = useStacValue({
    href,
    fileUpload,
    datetimeBounds: filter ? datetimeBounds : undefined,
    stacGeoparquetItemId,
  });
  const collectionsLink = value?.links?.find((link) => link.rel === "data");
  const { catalogs, collections: linkedCollections } = useStacChildren({
    value,
    enabled: !!value && !collectionsLink,
  });
  const collections = collectionsLink ? userCollections : linkedCollections;
  const items = userItems || linkedItems;
  const { filteredCollections, filteredItems } = useStacFilters({
    collections,
    items,
    filter,
    bbox,
    datetimeBounds,
  });

  const datetimes = useMemo(
    () => (value ? getDateTimes(value, items, collections) : null),
    [value, items, collections]
  );

  // Effects
  useEffect(() => {
    document.title = getDocumentTitle(value);
  }, [value]);

  useEffect(() => {
    setPicked(undefined);
    setItems(undefined);
    setDatetimeBounds(undefined);
    setCogTileHref(value && getCogTileHref(value));
  }, [value]);

  useEffect(() => {
    setCogTileHref(picked && getCogTileHref(picked));
  }, [picked]);

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
              items={filteredItems}
              fillColor={fillColor}
              lineColor={lineColor}
              setBbox={setBbox}
              picked={picked}
              setPicked={setPicked}
              setStacGeoparquetItemId={setStacGeoparquetItemId}
              cogTileHref={cogTileHref}
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
          setCollections={setCollections}
          collections={filteredCollections}
          totalNumOfCollections={collections?.length}
          filter={filter}
          setFilter={setFilter}
          bbox={bbox}
          setPicked={setPicked}
          picked={picked}
          items={filteredItems}
          setItems={setItems}
          setDatetimeBounds={setDatetimeBounds}
          cogTileHref={cogTileHref}
          setCogTileHref={setCogTileHref}
          datetimes={datetimes}
        ></Overlay>
      </Container>
      <Toaster></Toaster>
    </>
  );
}
