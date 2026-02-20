import { useItems } from "@/hooks/store";
import { useStore } from "@/store";
import type { StacValue } from "@/types/stac";
import {
  conformsToFreeTextCollectionSearch,
  getLinkHref,
  getStacValueTitle,
  getThumbnailAsset,
} from "@/utils/stac";
import { Badge, Heading, HStack, Stack } from "@chakra-ui/react";
import { useEffect, useMemo } from "react";
import type { StacAsset } from "stac-ts";
import Thumbnail from "../ui/thumbnail";
import Assets from "./assets";
import Breadcrumbs from "./breadcrumbs";
import Buttons from "./buttons";
import Catalogs from "./catalogs";
import ChildLinks from "./child-links";
import { CogHref, CogSources, PagedCogSources } from "./cogs";
import CollectionSearch from "./collection-search";
import Collections from "./collections";
import CollectionsHref from "./collections-href";
import Description from "./description";
import ItemLinks from "./item-links";
import Items from "./items";
import Links from "./links";
import Properties from "./properties";
import RootHref from "./root-href";
import StacGeoparquetHref from "./stac-geoparquet-href";

export default function Value({ value }: { value: StacValue }) {
  const href = useStore((store) => store.href);
  const hrefIsParquet = useStore((store) => store.hrefIsParquet);
  const connection = useStore((store) => store.connection);
  const collections = useStore((store) => store.collections);
  const catalogs = useStore((store) => store.catalogs);
  const setStaticItems = useStore((store) => store.setStaticItems);
  const asset = useStore((store) => store.asset);
  const staticItems = useStore((store) => store.staticItems);
  const searchedItems = useStore((store) => store.searchedItems);
  const setCogHref = useStore((store) => store.setCogHref);
  const setCogSources = useStore((store) => store.setCogSources);
  const setPagedCogSources = useStore((store) => store.setPagedCogSources);
  const version = value.stac_version as string | undefined;
  const description = value.description as string | undefined;
  const rootHref = getLinkHref(value, "root");
  const collectionsHref = getLinkHref(value, "data");
  const items = useItems();
  const thumbnailAsset = getThumbnailAsset(value);

  const childLinks = useMemo(() => {
    return value.links?.filter((link) => link.rel === "child");
  }, [value]);

  const itemLinks = useMemo(() => {
    return value.links?.filter((link) => link.rel === "item");
  }, [value]);

  useEffect(() => {
    document.title = "stac-map | " + getStacValueTitle(value);
  }, [value]);

  useEffect(() => {
    if (value.type === "FeatureCollection") setStaticItems(value.features);
  }, [value, setStaticItems]);

  useEffect(() => {
    if (!asset) setCogHref(null);
  }, [asset, setCogHref]);

  useEffect(() => {
    if (!staticItems) setCogSources(null);
  }, [staticItems, setCogSources]);

  useEffect(() => {
    if (!searchedItems) setPagedCogSources(null);
  }, [searchedItems, setPagedCogSources]);

  return (
    <Stack gap={8}>
      <Stack gap={4}>
        <Heading wordBreak={"break-all"}>
          <HStack gap={4}>
            {getStacValueTitle(value)}
            {version && <Badge variant={"surface"}>{version}</Badge>}
          </HStack>
        </Heading>
        <Breadcrumbs value={value} />
        {thumbnailAsset && <Thumbnail asset={thumbnailAsset} />}
        {description && <Description description={description} />}
        <Buttons value={value} />
      </Stack>

      <Stack>
        {conformsToFreeTextCollectionSearch(value) && <CollectionSearch />}
        {collectionsHref && <CollectionsHref href={collectionsHref} />}
        {collections && <Collections collections={collections} />}
        {catalogs && <Catalogs catalogs={catalogs} />}
        {value.type === "Feature" && (
          <Properties properties={value.properties} />
        )}
        {hrefIsParquet &&
          href &&
          connection &&
          value.type === "FeatureCollection" && (
            <StacGeoparquetHref href={href} connection={connection} />
          )}
        {!collectionsHref && childLinks && <ChildLinks links={childLinks} />}
        {itemLinks && <ItemLinks links={itemLinks} />}
        {rootHref && <RootHref value={value} href={rootHref} />}
        {(value.type === "Collection" || value.type === "FeatureCollection") &&
          items &&
          items?.length > 0 && <Items items={items} value={value} />}
        {value.links && <Links links={value.links} />}
        {(value.assets as { [k: string]: StacAsset }) && (
          <Assets assets={value.assets as { [k: string]: StacAsset }} />
        )}
        {asset && <CogHref asset={asset} />}
        {staticItems && <CogSources items={staticItems} />}
        {searchedItems && <PagedCogSources pages={searchedItems} />}
      </Stack>
    </Stack>
  );
}
