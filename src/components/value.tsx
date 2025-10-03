import { type ReactNode, useEffect, useMemo, useState } from "react";
import type { IconType } from "react-icons/lib";
import {
  LuArrowLeft,
  LuArrowRight,
  LuExternalLink,
  LuFile,
  LuFileQuestion,
  LuFiles,
  LuFilter,
  LuFilterX,
  LuFolder,
  LuFolderPlus,
  LuFolderSearch,
  LuLink,
  LuList,
  LuPause,
  LuPlay,
  LuSearch,
  LuStepForward,
} from "react-icons/lu";
import { MarkdownHooks } from "react-markdown";
import {
  Accordion,
  Button,
  ButtonGroup,
  Card,
  Heading,
  HStack,
  Icon,
  Image,
  Span,
  Stack,
} from "@chakra-ui/react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import type { StacCatalog, StacCollection, StacItem, StacLink } from "stac-ts";
import Assets from "./assets";
import Catalogs from "./catalogs";
import CollectionSearch from "./collection-search";
import Collections from "./collections";
import Filter from "./filter";
import ItemSearch from "./item-search";
import Items from "./items";
import Links from "./links";
import Properties from "./properties";
import { Prose } from "./ui/prose";
import type { BBox2D } from "../types/map";
import type {
  DatetimeBounds,
  StacAssets,
  StacCollections,
  StacSearch,
  StacValue,
} from "../types/stac";
import { fetchStac } from "../utils/stac";

export interface SharedValueProps {
  catalogs: StacCatalog[] | undefined;
  setCollections: (collections: StacCollection[] | undefined) => void;
  collections: StacCollection[] | undefined;
  filteredCollections: StacCollection[] | undefined;
  items: StacItem[] | undefined;
  filteredItems: StacItem[] | undefined;
  setHref: (href: string | undefined) => void;
  filter: boolean;
  setFilter: (filter: boolean) => void;
  bbox: BBox2D | undefined;
  setItems: (items: StacItem[] | undefined) => void;
  setDatetimeBounds: (bounds: DatetimeBounds | undefined) => void;
}

interface ValueProps extends SharedValueProps {
  href: string;
  value: StacValue;
}

export function Value({
  href,
  setHref,
  value,
  catalogs,
  collections,
  filteredCollections,
  setCollections,
  items,
  filteredItems,
  setItems,
  filter,
  setFilter,
  bbox,
  setDatetimeBounds,
}: ValueProps) {
  const [search, setSearch] = useState<StacSearch>();
  const [numberOfCollections, setNumberOfCollections] = useState<number>();
  const [fetchAllCollections, setFetchAllCollections] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);
  const selfHref = value.links?.find((link) => link.rel === "self")?.href;
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
  const { rootLink, collectionsLink, nextLink, prevLink, filteredLinks } =
    useMemo(() => {
      let rootLink: StacLink | undefined = undefined;
      let collectionsLink: StacLink | undefined = undefined;
      let nextLink: StacLink | undefined = undefined;
      let prevLink: StacLink | undefined = undefined;
      const filteredLinks = [];
      if (links) {
        for (const link of links) {
          switch (link.rel) {
            case "root":
              rootLink = link;
              break;
            case "data":
              collectionsLink = link;
              break;
            case "next":
              nextLink = link;
              break;
            case "previous":
              prevLink = link;
              break;
          }
          // We already show children and items in their own pane
          if (link.rel !== "child" && link.rel !== "item")
            filteredLinks.push(link);
        }
      }
      return { rootLink, collectionsLink, nextLink, prevLink, filteredLinks };
    }, [links]);
  const rootData = useQuery<StacValue | undefined>({
    queryKey: ["stac-value", rootLink?.href],
    enabled: !!rootLink,
    queryFn: () => rootLink && fetchStac(rootLink.href),
  });
  const searchLinks = useMemo(() => {
    return rootData.data?.links?.filter((link) => link.rel === "search");
  }, [rootData.data]);
  const collectionsResult = useInfiniteQuery({
    queryKey: ["stac-collections", collectionsLink?.href],
    queryFn: async ({ pageParam }) => {
      if (pageParam) {
        return await fetch(pageParam).then((response) => {
          if (response.ok) return response.json();
          else
            throw new Error(
              `Error while fetching collections from ${pageParam}`
            );
        });
      } else {
        return null;
      }
    },
    initialPageParam: collectionsLink?.href,
    getNextPageParam: (lastPage: StacCollections | null) =>
      lastPage?.links?.find((link) => link.rel == "next")?.href,
    enabled: !!collectionsLink,
  });
  useEffect(() => {
    setCollections(
      collectionsResult.data?.pages.flatMap((page) => page?.collections || [])
    );
    if (collectionsResult.data?.pages.at(0)?.numberMatched)
      setNumberOfCollections(collectionsResult.data?.pages[0]?.numberMatched);
  }, [collectionsResult.data, setCollections]);
  useEffect(() => {
    if (
      fetchAllCollections &&
      !collectionsResult.isFetching &&
      collectionsResult.hasNextPage
    )
      collectionsResult.fetchNextPage();
  }, [fetchAllCollections, collectionsResult]);
  useEffect(() => {
    setFetchAllCollections(false);
    setNumberOfCollections(undefined);
  }, [value]);

  // Handled by the value
  if (properties?.description) delete properties["description"];
  const thumbnailAsset = useMemo(() => {
    return (
      assets &&
      ((Object.keys(assets).includes("thumbnail") && assets["thumbnail"]) ||
        Object.values(assets).find((asset) =>
          asset.roles?.includes("thumbnail")
        ))
    );
  }, [assets]);

  useEffect(() => {
    setItems(undefined);
  }, [search, setItems]);

  return (
    <Stack gap={4}>
      <Heading>
        <HStack>
          <Icon>{getValueIcon(value)}</Icon>
          {(value.title as string) ||
            value.id ||
            href.split("/").at(-1)?.split("?").at(0)}
        </HStack>
      </Heading>

      {thumbnailAsset && !thumbnailError && (
        <Image
          src={thumbnailAsset.href}
          onError={() => setThumbnailError(true)}
        />
      )}

      {!!value.description && (
        <Prose>
          <MarkdownHooks>{value.description as string}</MarkdownHooks>
        </Prose>
      )}

      {selfHref && (
        <ButtonGroup variant={"surface"} size={"sm"}>
          <Button asChild>
            <a href={selfHref} target="_blank">
              <LuExternalLink /> Source
            </a>
          </Button>
          <Button asChild>
            <a
              href={
                // TODO make this configurable
                "https://radiantearth.github.io/stac-browser/#/external/" +
                href.replace(/^(https?:\/\/)/, "")
              }
              target="_blank"
            >
              <LuExternalLink /> STAC Browser
            </a>
          </Button>
          {value.type === "Feature" && (
            <Button asChild>
              <a
                href={"https://titiler.xyz/stac/viewer?url=" + selfHref}
                target="_blank"
              >
                <LuExternalLink></LuExternalLink> TiTiler
              </a>
            </Button>
          )}
        </ButtonGroup>
      )}

      {(prevLink || nextLink) && (
        <ButtonGroup variant={"surface"} size={"sm"}>
          {prevLink && (
            <Button onClick={() => setHref(prevLink.href)}>
              <LuArrowLeft />
              Prev
            </Button>
          )}
          <Span flex={"1"} />
          {nextLink && (
            <Button onClick={() => setHref(nextLink.href)}>
              Next
              <LuArrowRight />
            </Button>
          )}
        </ButtonGroup>
      )}

      {collectionsResult.hasNextPage && (
        <Card.Root size={"sm"} variant={"outline"}>
          <Card.Header>
            <Heading size={"sm"}>Collection pagination</Heading>
          </Card.Header>
          <Card.Body>
            <ButtonGroup size={"xs"} variant={"surface"}>
              <Button
                disabled={fetchAllCollections || collectionsResult.isFetching}
                onClick={() => {
                  if (
                    !collectionsResult.isFetching &&
                    collectionsResult.hasNextPage
                  )
                    collectionsResult.fetchNextPage();
                }}
              >
                Fetch more collections <LuStepForward />
              </Button>
              <Button
                onClick={() => setFetchAllCollections((previous) => !previous)}
              >
                {(fetchAllCollections && (
                  <>
                    Pause fetching collections <LuPause />
                  </>
                )) || (
                  <>
                    Fetch all collections <LuPlay />
                  </>
                )}
              </Button>
            </ButtonGroup>
          </Card.Body>
        </Card.Root>
      )}

      <Accordion.Root multiple size={"sm"} variant={"enclosed"}>
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
                  `(${filteredCollections?.length}/${numberOfCollections || collections.length})`) ||
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
          <Section title="Links" AccordionIcon={LuLink} accordionValue="links">
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
    </Stack>
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

function getValueIcon(value: StacValue) {
  switch (value.type) {
    case "Catalog":
      return <LuFolder />;
    case "Collection":
      return <LuFolderPlus />;
    case "Feature":
      return <LuFile />;
    case "FeatureCollection":
      return <LuFiles />;
    default:
      return <LuFileQuestion />;
  }
}
