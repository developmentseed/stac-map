import {
  Alert,
  Box,
  SkeletonText,
  Stack,
  type UseFileUploadReturn,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import type { StacLink } from "stac-ts";
import useStacMap from "../hooks/stac-map";
import type { SetHref } from "../types/app";
import type { StacSearch, StacValue } from "../types/stac";
import { Catalog } from "./catalog";
import { Collection } from "./collection";
import Introduction from "./introduction";
import Item from "./item";
import ItemCollection from "./item-collection";
import { NavigationBreadcrumbs } from "./navigation-breadcrumbs";
import { ItemSearchResults } from "./search/item";
import { getItemDatetimes } from "../stac";
import TemporalFilter from "./filter/temporal";

export default function Panel({
  href,
  setHref,
  fileUpload,
}: {
  href: string | undefined;
  setHref: SetHref;
  fileUpload: UseFileUploadReturn;
}) {
  const { value, picked, setPicked, items, setItems } = useStacMap();
  const [search, setSearch] = useState<StacSearch>();
  const [searchLink, setSearchLink] = useState<StacLink>();
  const [autoLoad, setAutoLoad] = useState(false);

  useEffect(() => {
    setItems(undefined);
    setPicked(undefined);
  }, [search, setPicked, setItems]);

  const { start: itemsStart, end: itemsEnd } = useMemo(() => {
    if (items) {
      let start = null;
      let end = null;
      for (const item of items) {
        const { start: itemStart, end: itemEnd } = getItemDatetimes(item);
        if (itemStart && (!start || itemStart < start)) start = itemStart;
        if (itemEnd && (!end || itemEnd > end)) end = itemEnd;
      }
      return { start, end };
    } else {
      return { start: null, end: null };
    }
  }, [items]);

  let content;
  if (!href) {
    content = (
      <Introduction fileUpload={fileUpload} setHref={setHref}></Introduction>
    );
  } else if (!value) {
    content = <SkeletonText noOfLines={3} />;
  } else if (picked) {
    content = (
      <ValueContent
        value={picked}
        setHref={setHref}
        search={search}
        setSearch={setSearch}
        setSearchLink={setSearchLink}
        autoLoad={autoLoad}
        setAutoLoad={setAutoLoad}
      ></ValueContent>
    );
  } else {
    content = (
      <ValueContent
        value={value}
        setHref={setHref}
        search={search}
        setSearch={setSearch}
        setSearchLink={setSearchLink}
        autoLoad={autoLoad}
        setAutoLoad={setAutoLoad}
      ></ValueContent>
    );
  }

  return (
    <Box bg={"bg.muted"} rounded={4} pointerEvents={"auto"} overflow={"hidden"}>
      <Box px={4} py={3} borderBottomWidth={1} borderColor={"border.subtle"}>
        <NavigationBreadcrumbs
          href={href}
          setHref={setHref}
        ></NavigationBreadcrumbs>
      </Box>
      <Stack overflow={"scroll"} maxH={{ base: "40dvh", md: "80dvh" }} p={4}>
        {content}
        {search && searchLink && (
          <ItemSearchResults
            search={search}
            setSearch={setSearch}
            link={searchLink}
            autoLoad={autoLoad}
            setAutoLoad={setAutoLoad}
          ></ItemSearchResults>
        )}
        {itemsStart && itemsEnd && (
          <TemporalFilter start={itemsStart} end={itemsEnd} />
        )}
      </Stack>
    </Box>
  );
}

function ValueContent({
  value,
  setHref,
  search,
  setSearch,
  setSearchLink,
  autoLoad,
  setAutoLoad,
}: {
  value: StacValue;
  setHref: SetHref;
  search: StacSearch | undefined;
  setSearch: (search: StacSearch | undefined) => void;
  setSearchLink: (link: StacLink | undefined) => void;
  autoLoad: boolean;
  setAutoLoad: (autoLoad: boolean) => void;
}) {
  switch (value.type) {
    case "Catalog":
      return <Catalog catalog={value} setHref={setHref}></Catalog>;
    case "Collection":
      return (
        <Collection
          collection={value}
          setHref={setHref}
          search={search}
          setSearch={setSearch}
          setSearchLink={setSearchLink}
          autoLoad={autoLoad}
          setAutoLoad={setAutoLoad}
        ></Collection>
      );
    case "Feature":
      return <Item item={value}></Item>;
    case "FeatureCollection":
      return <ItemCollection itemCollection={value}></ItemCollection>;
    case undefined:
      return (
        <Alert.Root status="error">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Value does not have a "type" field</Alert.Title>
          </Alert.Content>
        </Alert.Root>
      );
    default:
      return (
        <Alert.Root status="error">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Unknown "type" field</Alert.Title>
            <Alert.Description>
              {
                // @ts-expect-error Fallback for unknown types
                value.type
              }{" "}
              is not a valid STAC type
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      );
  }
}
