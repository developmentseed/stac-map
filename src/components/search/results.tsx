import { useStore } from "@/store";
import type { StacItemCollection, StacSearch } from "@/types/stac";
import { fetchStac, getLinkHref } from "@/utils/stac";
import {
  ActionBar,
  Alert,
  Button,
  ButtonGroup,
  HStack,
  IconButton,
  Portal,
  Progress,
  Span,
  Spinner,
} from "@chakra-ui/react";
import {
  useInfiniteQuery,
  type UseInfiniteQueryResult,
} from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { LuForward, LuLoader, LuPause, LuPlay, LuX } from "react-icons/lu";
import type { StacItem } from "stac-ts";

interface SearchResultsActionBarProps {
  items: StacItem[] | null;
  numberMatched: number | undefined;
  fetchAllItems: boolean;
  setFetchAllItems: (fetchAllItems: boolean) => void;
}

export default function SearchResults({
  href,
  search,
}: {
  href: string;
  search: StacSearch;
}) {
  const items = useStore((store) => store.items);
  const setItems = useStore((store) => store.setItems);
  const [fetchAllItems, setFetchAllItems] = useState(false);

  const searchHref = useMemo(() => {
    const url = new URL(href);
    url.searchParams.set("collections", search.collections.join(","));
    if (search.bbox) url.searchParams.set("bbox", search.bbox.join(","));
    if (search.limit) url.searchParams.set("limit", search.limit.toFixed(0));
    if (search.queryables)
      Object.entries(search.queryables)
        .filter((_, value) => !!value)
        .forEach(([key, value]) => {
          url.searchParams.set(key, String(value));
        });
    return url.toString();
  }, [href, search]);

  const result = useInfiniteQuery({
    queryKey: ["stac-search", searchHref],
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
    initialPageParam: searchHref,
    getNextPageParam: (lastPage) =>
      lastPage ? getLinkHref(lastPage, "next") : null,
  });

  useEffect(() => {
    if (result.data)
      setItems(result.data.pages.flatMap((page) => page?.features || []));
  }, [result.data, setItems]);

  useEffect(() => {
    if (fetchAllItems && !result.isFetching && result.hasNextPage)
      result.fetchNextPage();
  }, [fetchAllItems, result]);

  const numberMatched = useMemo(() => {
    return result.data?.pages.at(0)?.numberMatched;
  }, [result.data]);

  return (
    <>
      <SearchResultsProgress
        items={items}
        numberMatched={numberMatched}
        fetchAllItems={fetchAllItems}
        setFetchAllItems={setFetchAllItems}
        {...result}
      />
      <SearchResultsActionBar
        items={items}
        numberMatched={numberMatched}
        fetchAllItems={fetchAllItems}
        setFetchAllItems={setFetchAllItems}
        {...result}
      />
    </>
  );
}

interface SearchResultsProgressProps {
  items: StacItem[] | null;
  numberMatched: number | undefined;
  fetchAllItems: boolean;
  setFetchAllItems: (fetchAllItems: boolean) => void;
}

function SearchResultsProgress({
  items,
  numberMatched,
  fetchAllItems,
  setFetchAllItems,
  hasNextPage,
  isFetching,
  fetchNextPage,
}: SearchResultsProgressProps & UseInfiniteQueryResult) {
  const setSearch = useStore((store) => store.setSearch);

  if (items?.length === 0 && !hasNextPage) {
    return (
      <Alert.Root status={"warning"}>
        <Alert.Indicator />
        <Alert.Title>No results found</Alert.Title>
      </Alert.Root>
    );
  }

  const status =
    numberMatched || items === null ? (
      <Progress.Root
        width={"full"}
        value={items?.length || null}
        max={numberMatched}
        striped={hasNextPage}
        animated={isFetching || fetchAllItems}
      >
        <Progress.Track>
          <Progress.Range />
        </Progress.Track>
      </Progress.Root>
    ) : (
      <Span width={"full"}>
        {items?.length || 0} item{items?.length === 1 ? "" : "s"} items found
        {(fetchAllItems || isFetching) && <Spinner size={"xs"} ml={4} />}
      </Span>
    );

  const buttons = (
    <ButtonGroup size="xs" variant={"subtle"}>
      <IconButton
        onClick={() => fetchNextPage()}
        disabled={isFetching || !hasNextPage}
      >
        {isFetching ? <LuLoader /> : <LuForward />}
      </IconButton>
      <IconButton
        onClick={() => setFetchAllItems(!fetchAllItems)}
        disabled={!hasNextPage}
      >
        {fetchAllItems && hasNextPage ? <LuPause /> : <LuPlay />}
      </IconButton>
      <IconButton onClick={() => setSearch(null)}>
        <LuX />
      </IconButton>
    </ButtonGroup>
  );

  return (
    <HStack width={"full"}>
      {status}
      {buttons}
    </HStack>
  );
}

function SearchResultsActionBar({
  items,
  numberMatched,
  fetchAllItems,
  setFetchAllItems,
  hasNextPage,
  isFetching,
  fetchNextPage,
}: SearchResultsActionBarProps & UseInfiniteQueryResult) {
  return (
    <ActionBar.Root open={!!items}>
      <Portal>
        <ActionBar.Positioner>
          <ActionBar.Content>
            <ActionBar.SelectionTrigger>
              {items?.length}
              {numberMatched && "/" + numberMatched} item
              {items?.length != 1 && "s"} fetched
            </ActionBar.SelectionTrigger>
            {hasNextPage && (
              <>
                <ActionBar.Separator />
                <ButtonGroup variant="outline" size="sm">
                  <Button
                    onClick={() => fetchNextPage()}
                    disabled={isFetching || fetchAllItems}
                  >
                    <LuForward />
                    Fetch next page
                  </Button>
                  <Button onClick={() => setFetchAllItems(!fetchAllItems)}>
                    {fetchAllItems ? <LuPause /> : <LuPlay />}
                    {fetchAllItems && hasNextPage ? "Pause" : "Fetch all"}
                  </Button>
                </ButtonGroup>
              </>
            )}
          </ActionBar.Content>
        </ActionBar.Positioner>
      </Portal>
    </ActionBar.Root>
  );
}
