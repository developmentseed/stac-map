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
  HStack,
  IconButton,
  Portal,
  Progress,
} from "@chakra-ui/react";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { StacCollection } from "stac-ts";
import type { BBox } from "geojson";
import { useBoundStore } from "../store/index.ts";
import type { StacItemCollection, StacSearch } from "../types/stac";
import { sanitizeBbox } from "../utils/map.ts";
import { fetchStac, getLinkHref } from "../utils/stac.ts";

interface Props {
  href: string;
  collection: StacCollection;
}

export default function Search({ href, collection }: Props) {
  const setSearchItems = useBoundStore((store) => store.setSearchItems);
  const [search, setSearch] = useState<StacSearch | null>(null);
  const { map } = useMap();

  return (
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
                bbox: sanitizeBbox(map?.getBounds().toArray().flat() as BBox),
              });
            }}
          >
            <LuSearch />
            Search
          </Button>
        )}
      </ButtonGroup>
      {search && <SearchResults href={href} search={search} />}
    </>
  );
}

function SearchResults({ href, search }: { href: string; search: StacSearch }) {
  const searchItems = useBoundStore((store) => store.searchItems);
  const setSearchItems = useBoundStore((store) => store.setSearchItems);
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
      <HStack mx={2}>
        <Progress.Root
          value={numberMatched ? searchItems?.length : null}
          max={numberMatched}
          width="full"
        >
          <Progress.Track>
            <Progress.Range />
          </Progress.Track>
        </Progress.Root>
        <ButtonGroup size="2xs" variant="plain">
          <IconButton
            onClick={() => result.fetchNextPage()}
            disabled={!result.hasNextPage || result.isFetching}
          >
            <LuForward />
          </IconButton>
          {fetchAllItems ? (
            <IconButton
              onClick={() => setFetchAllItems(false)}
              disabled={!result.hasNextPage}
            >
              <LuPause />
            </IconButton>
          ) : (
            <IconButton
              onClick={() => setFetchAllItems(true)}
              disabled={!result.hasNextPage}
            >
              <LuPlay />
            </IconButton>
          )}
        </ButtonGroup>
      </HStack>
      <ActionBar.Root open={!!searchItems}>
        <Portal>
          <ActionBar.Positioner>
            <ActionBar.Content>
              <ActionBar.SelectionTrigger>
                {searchItems?.length}
                {numberMatched && "/" + numberMatched} item
                {searchItems?.length != 1 && "s"} fetched
              </ActionBar.SelectionTrigger>
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
