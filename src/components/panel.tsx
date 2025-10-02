import { type ReactNode, useEffect, useMemo, useState } from "react";
import type { IconType } from "react-icons/lib";
import {
  LuFiles,
  LuFilter,
  LuFilterX,
  LuFolder,
  LuFolderPlus,
  LuFolderSearch,
  LuLink,
  LuList,
  LuSearch,
} from "react-icons/lu";
import {
  Accordion,
  Alert,
  Box,
  HStack,
  Icon,
  SkeletonText,
  type UseFileUploadReturn,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import type { StacCatalog, StacCollection, StacItem } from "stac-ts";
import Assets from "./assets";
import Catalogs from "./catalogs";
import CollectionSearch from "./collection-search";
import Collections from "./collections";
import Filter from "./filter";
import Introduction from "./introduction";
import ItemSearch from "./item-search";
import Items from "./items";
import Links from "./links";
import Properties from "./properties";
import Value from "./value";
import type { BBox2D } from "../types/map";
import type {
  DatetimeBounds,
  StacAssets,
  StacSearch,
  StacValue,
} from "../types/stac";
import { fetchStac } from "../utils/stac";

export default function Panel({
  value,
  error,
  catalogs,
  collections,
  filteredCollections,
  items,
  filteredItems,
  href,
  setHref,
  fileUpload,
  filter,
  setFilter,
  bbox,
  setItems,
  setDatetimeBounds,
}: {
  value: StacValue | undefined;
  error: Error | undefined;
  catalogs: StacCatalog[] | undefined;
  collections: StacCollection[] | undefined;
  filteredCollections: StacCollection[] | undefined;
  items: StacItem[] | undefined;
  filteredItems: StacItem[] | undefined;
  href: string | undefined;
  setHref: (href: string | undefined) => void;
  fileUpload: UseFileUploadReturn;
  filter: boolean;
  setFilter: (filter: boolean) => void;
  bbox: BBox2D | undefined;
  setItems: (items: StacItem[] | undefined) => void;
  setDatetimeBounds: (bounds: DatetimeBounds | undefined) => void;
}) {
  const [search, setSearch] = useState<StacSearch>();
  const rootHref = value?.links?.find((link) => link.rel === "root")?.href;
  const rootData = useQuery<StacValue>({
    queryKey: ["stac-value", rootHref],
    enabled: !!rootHref,
    queryFn: () => fetchStac(rootHref),
  });
  const searchLinks = rootData.data?.links?.filter(
    (link) => link.rel === "search"
  );
  const { links, assets, properties } = useMemo(() => {
    if (value) {
      if (value.type === "Feature") {
        return {
          links: value.links,
          assets: value.assets as StacAssets | undefined,
          properties: value.properties,
        };
      } else {
        const { links, assets, ...properties } = value;
        return { links, assets: assets as StacAssets | undefined, properties };
      }
    } else {
      return { links: undefined, assets: undefined, properties: undefined };
    }
  }, [value]);

  // Handled by the value
  if (properties?.description) delete properties["description"];
  const thumbnailAsset =
    assets &&
    ((Object.keys(assets).includes("thumbnail") && assets["thumbnail"]) ||
      Object.values(assets).find((asset) =>
        asset.roles?.includes("thumbnail")
      ));
  const nextLink = links?.find((link) => link.rel === "next");
  const prevLink = links?.find((link) => link.rel === "previous");
  // We already provide linked children and items in their own pane.
  const filteredLinks = links?.filter(
    (link) => link.rel !== "child" && link.rel !== "item"
  );

  useEffect(() => {
    setItems(undefined);
  }, [search, setItems]);

  return (
    <Box p={4} overflow={"scroll"} maxH={"80dvh"}>
      {(href && value && (
        <Value
          value={value}
          thumbnailAsset={thumbnailAsset}
          href={href}
          setHref={setHref}
          nextLink={nextLink}
          prevLink={prevLink}
        />
      )) ||
        (error && (
          <Alert.Root status={"error"}>
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>Error while fetching STAC value</Alert.Title>
              <Alert.Description>{error.toString()}</Alert.Description>
            </Alert.Content>
          </Alert.Root>
        )) ||
        (href && <SkeletonText />) || (
          <Introduction setHref={setHref} fileUpload={fileUpload} />
        )}

      {value && (
        <Accordion.Root multiple size={"sm"} variant={"enclosed"} mt={4}>
          {catalogs && (
            <Section
              title={`Catalogs (${catalogs.length})`}
              AccordionIcon={LuFolder}
              accordionValue="catalogs"
            >
              <Catalogs catalogs={catalogs} setHref={setHref} />
            </Section>
          )}

          {collections && (
            <Section
              title={
                <>
                  Collections{" "}
                  {(filteredCollections &&
                    `(${filteredCollections?.length}/${collections.length})`) ||
                    `(${collections.length})`}
                </>
              }
              AccordionIcon={LuFolderPlus}
              accordionValue="collections"
            >
              <Collections
                collections={filteredCollections || collections}
                setHref={setHref}
              />
            </Section>
          )}

          {collections && (
            <Section
              title="Collection search"
              AccordionIcon={LuFolderSearch}
              accordionValue="collection-search"
            >
              <CollectionSearch
                collections={collections}
                setHref={setHref}
                catalogHref={value?.type === "Catalog" ? href : undefined}
              />
            </Section>
          )}

          {value.type === "Collection" &&
            searchLinks &&
            searchLinks.length > 0 && (
              <Section
                title="Item search"
                AccordionIcon={LuSearch}
                accordionValue="item-search"
              >
                <ItemSearch
                  search={search}
                  setSearch={setSearch}
                  links={searchLinks}
                  bbox={bbox}
                  collection={value}
                  setItems={setItems}
                />
              </Section>
            )}

          {(items || collections || value.type === "FeatureCollection") && (
            <Section
              title={"Filtering"}
              AccordionIcon={filter ? LuFilter : LuFilterX}
              accordionValue="filter"
            >
              <Filter
                filter={filter}
                setFilter={setFilter}
                bbox={bbox}
                setDatetimeBounds={setDatetimeBounds}
                value={value}
                items={items}
                collections={collections}
              />
            </Section>
          )}

          {items && (
            <Section
              title={
                <>
                  Items{" "}
                  {(filteredItems &&
                    `(${filteredItems?.length}/${items.length})`) ||
                    `(${items.length})`}
                </>
              }
              AccordionIcon={LuFolderPlus}
              accordionValue="collections"
            >
              <Items items={filteredItems || items} setHref={setHref} />
            </Section>
          )}

          {assets && (
            <Section
              title="Assets"
              AccordionIcon={LuFiles}
              accordionValue="assets"
            >
              <Assets assets={assets} />
            </Section>
          )}

          {filteredLinks && filteredLinks.length > 0 && (
            <Section
              title="Links"
              AccordionIcon={LuLink}
              accordionValue="links"
            >
              <Links links={filteredLinks} setHref={setHref} />
            </Section>
          )}

          {properties && (
            <Section
              title="Properties"
              AccordionIcon={LuList}
              accordionValue="properties"
            >
              <Properties properties={properties} />
            </Section>
          )}
        </Accordion.Root>
      )}
    </Box>
  );
}

function Section({
  title,
  AccordionIcon,
  accordionValue,
  children,
}: {
  title: ReactNode;
  AccordionIcon: IconType;
  accordionValue: string;
  children: ReactNode;
}) {
  return (
    <Accordion.Item value={accordionValue}>
      <Accordion.ItemTrigger>
        <HStack flex={"1"}>
          <Icon>
            <AccordionIcon />
          </Icon>{" "}
          {title}
        </HStack>
        <Accordion.ItemIndicator />
      </Accordion.ItemTrigger>
      <Accordion.ItemContent>
        <Accordion.ItemBody>{children}</Accordion.ItemBody>
      </Accordion.ItemContent>
    </Accordion.Item>
  );
}
