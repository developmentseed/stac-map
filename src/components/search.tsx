import { useEffect, useMemo, useState } from "react";
import {
  LuForward,
  LuPause,
  LuPlay,
  LuSearch,
  LuSettings,
  LuX,
} from "react-icons/lu";
import { useMap } from "react-map-gl/maplibre";
import {
  ActionBar,
  Button,
  ButtonGroup,
  List,
  Portal,
  SkeletonText,
  Stack,
} from "@chakra-ui/react";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { StacCollection, StacItem } from "stac-ts";
import type { BBox } from "geojson";
import { type ListOrCard, Section } from "./section";
import ValueCard from "./value-card";
import ValueListItem from "./value-list-item";
import { useStore } from "../store.ts";
import type { StacItemCollection, StacSearch } from "../types/stac";
import { sanitizeBbox } from "../utils/map.ts";
import { fetchStac, getLinkHref } from "../utils/stac.ts";

interface Props {
  href: string;
  collection: StacCollection;
}

export default function Search({ href, collection }: Props) {
  const searchItems = useStore((store) => store.searchItems);
  const setSearchItems = useStore((store) => store.setSearchItems);
  const [search, setSearch] = useState<StacSearch | null>(null);
  const { map } = useMap();

  return (
    <Section
      icon={<LuSearch />}
      title="Item search"
      count={searchItems?.length}
      defaultListOrCard="list"
    >
      {(listOrCard) => (
        <>
          <ButtonGroup>
            <Button variant={"outline"} disabled={!!search}>
              <LuSettings />
              Configure
            </Button>

            {search ? (
              <Button
                onClick={() => {
                  setSearchItems(null);
                  setSearch(null);
                }}
                variant={"surface"}
              >
                <LuX /> Clear
              </Button>
            ) : (
              <Button
                onClick={() => {
                  setSearchItems(null);
                  setSearch({
                    collections: [collection.id],
                    bbox: sanitizeBbox(
                      map?.getBounds().toArray().flat() as BBox
                    ),
                  });
                }}
              >
                <LuSearch />
                Search
              </Button>
            )}
          </ButtonGroup>

          {search && (
            <SearchResults
              href={href}
              search={search}
              listOrCard={listOrCard}
            />
          )}
        </>
      )}
    </Section>
  );
}

function SearchResults({
  href,
  search,
  listOrCard,
}: {
  href: string;
  search: StacSearch;
  listOrCard: ListOrCard;
}) {
  const searchItems = useStore((store) => store.searchItems);
  const setSearchItems = useStore((store) => store.setSearchItems);
  const [fetchAllItems, setFetchAllItems] = useState(false);

  const url = useMemo(() => {
    return new URL(href);
  }, [href]);

  if (search.collections)
    url.searchParams.set("collections", search.collections.join(","));
  if (search.bbox) url.searchParams.set("bbox", search.bbox.join(","));

  const result = useInfiniteQuery({
    queryKey: ["stac-search", href, search],
    queryFn: async ({ pageParam }) => {
      if (pageParam) {
        return (await fetchStac({
          href: pageParam,
          method: "GET",
        })) as StacItemCollection;
      } else {
        return null;
      }
    },
    initialPageParam: url.toString(),
    getNextPageParam: (lastPage) =>
      lastPage ? getLinkHref(lastPage, "next") : null,
  });

  const numberMatched = result.data?.pages.at(0)?.numberMatched;

  useEffect(() => {
    if (result.data)
      setSearchItems(result.data.pages.flatMap((page) => page?.features || []));
  }, [result.data, setSearchItems]);

  useEffect(() => {
    if (fetchAllItems && !result.isFetching && result.hasNextPage)
      result.fetchNextPage();
  }, [fetchAllItems, result]);

  return (
    <>
      <Stack>
        {searchItems && (
          <SearchItems listOrCard={listOrCard} items={searchItems} />
        )}

        {result.isFetching && <SkeletonText />}
      </Stack>
      <ActionBar.Root open={!!searchItems}>
        <Portal>
          <ActionBar.Positioner>
            <ActionBar.Content>
              <ActionBar.SelectionTrigger>
                {searchItems?.length}
                {numberMatched && "/" + numberMatched} item
                {searchItems?.length != 1 && "s"} fetched
              </ActionBar.SelectionTrigger>
              <ActionBar.Separator />
              {result.hasNextPage && (
                <>
                  <ActionBar.Separator />
                  <ButtonGroup variant="outline" size="sm">
                    <Button
                      onClick={() => result.fetchNextPage()}
                      disabled={result.isFetching || fetchAllItems}
                    >
                      <LuForward />
                      Fetch next page
                    </Button>
                    <Button
                      onClick={() => setFetchAllItems((previous) => !previous)}
                    >
                      {fetchAllItems ? <LuPause /> : <LuPlay />}
                      {fetchAllItems && result.hasNextPage
                        ? "Pause"
                        : "Fetch all"}
                    </Button>
                  </ButtonGroup>
                </>
              )}
            </ActionBar.Content>
          </ActionBar.Positioner>
        </Portal>
      </ActionBar.Root>
    </>
  );
}

function SearchItems({
  items,
  listOrCard,
}: {
  items: StacItem[];
  listOrCard: ListOrCard;
}) {
  if (listOrCard === "list") {
    return (
      <List.Root variant={"plain"}>
        {items.map((item) => (
          <ValueListItem key={item.id} value={item} />
        ))}
      </List.Root>
    );
  } else {
    return (
      <Stack>
        {items.map((item) => (
          <ValueCard key={item.id} value={item} />
        ))}
      </Stack>
    );
  }
}
