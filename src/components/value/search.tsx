import { Section } from "@/components/section";
import { useItems } from "@/hooks/store";
import { useStore } from "@/store/index.ts";
import type { StacItemCollection } from "@/types/stac";
import { fetchStac, getLinkHref } from "@/utils/stac";
import {
  ActionBar,
  Alert,
  Button,
  ButtonGroup,
  DataList,
  HStack,
  IconButton,
  Portal,
  Progress,
  Span,
  Spinner,
  Stack,
} from "@chakra-ui/react";
import {
  useInfiniteQuery,
  type UseInfiniteQueryResult,
} from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  LuFocus,
  LuForward,
  LuLoader,
  LuPause,
  LuPlay,
  LuSearch,
  LuUndo,
} from "react-icons/lu";
import type { StacCollection, StacItem } from "stac-ts";
import { Tooltip } from "../ui/tooltip";

interface Props {
  href: string;
  collection: StacCollection;
}

export default function Search({ href, collection }: Props) {
  const setSearch = useStore((store) => store.setSearch);

  useEffect(() => {
    setSearch({ collections: [collection.id] });
  }, [collection, setSearch]);

  return (
    <Section icon={<LuSearch />} title="Item search">
      <Stack gap={4}>
        <SearchResults href={href} />
        <SearchDetails />
      </Stack>
    </Section>
  );
}

function SearchResults({ href }: { href: string }) {
  const search = useStore((store) => store.search);
  const setPagedItems = useStore((store) => store.setPagedItems);
  const [fetchAllItems, setFetchAllItems] = useState(false);
  const items = useItems();

  const searchHref = useMemo(() => {
    const url = new URL(href);
    url.searchParams.set("collections", search.collections.join(","));
    if (search.bbox) url.searchParams.set("bbox", search.bbox.join(","));
    if (search.limit) url.searchParams.set("limit", search.limit.toFixed(0));
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
      setPagedItems(result.data.pages.map((page) => page?.features || []));
  }, [result.data, setPagedItems]);

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

function SearchDetails() {
  const search = useStore((state) => state.search);

  return (
    <DataList.Root size={"sm"} orientation={"horizontal"}>
      <DataList.Item>
        <DataList.ItemLabel>Collection</DataList.ItemLabel>
        <DataList.ItemValue>{search.collections.join(", ")}</DataList.ItemValue>
      </DataList.Item>
    </DataList.Root>
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
  const search = useStore((state) => state.search);
  const setSearch = useStore((state) => state.setSearch);
  const bbox = useStore((state) => state.bbox);

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
        {((fetchAllItems || isFetching) && <Spinner size={"xs"} ml={4} />) ||
          `${items?.length || 0} item${items?.length === 1 ? "" : "s"} items found`}
      </Span>
    );

  const buttons = (
    <ButtonGroup size="xs" variant={"subtle"} attached>
      <Tooltip content="Fetch next page">
        <IconButton
          onClick={() => fetchNextPage()}
          disabled={isFetching || !hasNextPage}
        >
          {isFetching ? <LuLoader /> : <LuForward />}
        </IconButton>
      </Tooltip>
      <Tooltip content={fetchAllItems && hasNextPage ? "Pause" : "Fetch all"}>
        <IconButton
          onClick={() => setFetchAllItems(!fetchAllItems)}
          disabled={!hasNextPage}
        >
          {fetchAllItems && hasNextPage ? <LuPause /> : <LuPlay />}
        </IconButton>
      </Tooltip>
      <Tooltip content="Set bbox to current viewport">
        <IconButton
          onClick={() => {
            setSearch({ ...search, bbox: bbox || undefined });
          }}
        >
          <LuFocus />
        </IconButton>
      </Tooltip>
      <Tooltip content="Reset search">
        <IconButton
          onClick={() => {
            setSearch({ collections: search.collections });
          }}
        >
          <LuUndo />
        </IconButton>
      </Tooltip>
    </ButtonGroup>
  );

  return (
    <HStack width={"full"}>
      {status}
      {buttons}
    </HStack>
  );
}

interface SearchResultsActionBarProps {
  items: StacItem[] | null;
  numberMatched: number | undefined;
  fetchAllItems: boolean;
  setFetchAllItems: (fetchAllItems: boolean) => void;
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
