import { useEffect, useMemo, useState } from "react";
import {
  LuArrowLeft,
  LuArrowRight,
  LuExternalLink,
  LuFile,
  LuFileQuestion,
  LuFiles,
  LuFolder,
  LuFolderPlus,
  LuPause,
  LuPlay,
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
import { useQuery } from "@tanstack/react-query";
import type { StacCatalog, StacCollection, StacItem } from "stac-ts";
import AssetsSection from "./sections/assets";
import CatalogsSection from "./sections/catalogs";
import CollectionSearchSection from "./sections/collection-search";
import CollectionsSection from "./sections/collections";
import FilterSection from "./sections/filter";
import ItemSearchSection from "./sections/item-search";
import ItemsSection from "./sections/items";
import LinksSection from "./sections/links";
import PropertiesSection from "./sections/properties";
import { Prose } from "./ui/prose";
import useStacCollections from "../hooks/stac-collections";
import type { BBox2D } from "../types/map";
import type { DatetimeBounds, StacSearch, StacValue } from "../types/stac";
import { deconstructStac, fetchStac, getImportantLinks } from "../utils/stac";

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
  cogTileHref: string | undefined;
  setCogTileHref: (href: string | undefined) => void;
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
  cogTileHref,
  setCogTileHref,
}: ValueProps) {
  const [search, setSearch] = useState<StacSearch>();
  const [numberOfCollections, setNumberOfCollections] = useState<number>();
  const [fetchAllCollections, setFetchAllCollections] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);

  const selfHref = value.links?.find((link) => link.rel === "self")?.href;

  const { links, assets, properties } = useMemo(() => {
    return deconstructStac(value);
  }, [value]);
  // Description is handled at the top of the panel, so we don't need it down in
  // the properties.
  if (properties?.description) delete properties["description"];

  const { rootLink, collectionsLink, nextLink, prevLink, filteredLinks } =
    useMemo(() => {
      return getImportantLinks(links);
    }, [links]);

  const rootData = useQuery<StacValue | undefined>({
    queryKey: ["stac-value", rootLink?.href],
    enabled: !!rootLink,
    queryFn: () => rootLink && fetchStac(rootLink.href),
  });

  const searchLinks = useMemo(() => {
    return rootData.data?.links?.filter((link) => link.rel === "search");
  }, [rootData.data]);

  const collectionsResult = useStacCollections(collectionsLink?.href);

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
          maxH={"200"}
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
        {catalogs && catalogs.length > 0 && (
          <CatalogsSection catalogs={catalogs} setHref={setHref} />
        )}

        {collections && collections.length && (
          <CollectionsSection
            collections={collections}
            numberOfCollections={numberOfCollections}
            filteredCollections={filteredCollections}
            setHref={setHref}
          />
        )}

        {collections && (
          <CollectionSearchSection
            collections={collections}
            setHref={setHref}
            catalogHref={value?.type === "Catalog" ? href : undefined}
          />
        )}

        {value.type === "Collection" &&
          searchLinks &&
          searchLinks.length > 0 && (
            <ItemSearchSection
              search={search}
              setSearch={setSearch}
              links={searchLinks}
              bbox={bbox}
              collection={value}
              setItems={setItems}
            />
          )}

        {(items || collections || value.type === "FeatureCollection") && (
          <FilterSection
            filter={filter}
            setFilter={setFilter}
            bbox={bbox}
            setDatetimeBounds={setDatetimeBounds}
            value={value}
            items={items}
            collections={collections}
          />
        )}

        {items && (
          <ItemsSection
            items={items}
            filteredItems={filteredItems}
            setHref={setHref}
          />
        )}

        {assets && (
          <AssetsSection
            assets={assets}
            cogTileHref={cogTileHref}
            setCogTileHref={setCogTileHref}
          />
        )}

        {filteredLinks && filteredLinks.length > 0 && (
          <LinksSection links={filteredLinks} setHref={setHref} />
        )}

        {properties && <PropertiesSection properties={properties} />}
      </Accordion.Root>
    </Stack>
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
