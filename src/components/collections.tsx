import {
  type Dispatch,
  type SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  LuFilter,
  LuFolderPlus,
  LuForward,
  LuPause,
  LuPlay,
  LuSearch,
  LuSearchCode,
} from "react-icons/lu";
import {
  ActionBar,
  Button,
  ButtonGroup,
  Center,
  Checkbox,
  CloseButton,
  Input,
  InputGroup,
  Link,
  List,
  Portal,
  SkeletonText,
  Stack,
} from "@chakra-ui/react";
import {
  type InfiniteData,
  useInfiniteQuery,
  type UseInfiniteQueryResult,
} from "@tanstack/react-query";
import type { StacCollection } from "stac-ts";
import { type ListOrCard, Section } from "./section";
import { toaster } from "./ui/toaster";
import ValueCard from "./value-card";
import ValueListItem from "./value-list-item";
import { useStore } from "../store";
import type { StacCollections } from "../types/stac";
import { getLinkHref, isCollectionInBbox } from "../utils/stac";

export default function Collections({ href }: { href: string }) {
  const setCollections = useStore((state) => state.setCollections);
  const collections = useStore((store) => store.collections);
  const filteredCollections = useStore((store) => store.filteredCollections);
  const [fetchAllCollections, setFetchAllCollections] = useState(false);

  const result = useInfiniteQuery({
    queryKey: ["stac-collections", href],
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
    initialPageParam: href,
    getNextPageParam: (lastPage: StacCollections | null) =>
      lastPage ? getLinkHref(lastPage, "next") : undefined,
  });

  useEffect(() => {
    setCollections(
      result.data?.pages.flatMap(
        (collections) => collections?.collections || []
      ) || null
    );
  }, [result.data, setCollections]);

  useEffect(() => {
    if (fetchAllCollections && !result.isFetching && result.hasNextPage) {
      result.fetchNextPage();
    }
  }, [fetchAllCollections, result]);

  useEffect(() => {
    if (result.error) {
      toaster.create({
        type: "error",
        title: href,
        description: result.error.message,
      });
    }
  }, [result.error, href]);

  return (
    <>
      <Section
        icon={<LuFolderPlus />}
        title="Collections"
        count={collections?.length}
        filteredCount={filteredCollections?.length}
      >
        {(listOrCard) => (
          <>
            <CollectionSearch />
            <CollectionValues listOrCard={listOrCard} {...result} />
          </>
        )}
      </Section>

      <CollectionActionBar
        fetchAllCollections={fetchAllCollections}
        setFetchAllCollections={setFetchAllCollections}
        {...result}
      />
    </>
  );
}

function CollectionSearch() {
  const collections = useStore((store) => store.collections);
  const setFilteredCollections = useStore(
    (store) => store.setFilteredCollections
  );
  const bbox = useStore((store) => store.bbox);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [filterViewport, setFilterViewport] = useState(true);
  const [searchMode] = useState<
    "filter" | "search" | "natural-language-search"
  >("filter");

  const startElement =
    searchMode === "filter" ? (
      <LuFilter />
    ) : searchMode === "search" ? (
      <LuSearch />
    ) : (
      <LuSearchCode />
    );
  const endElement = (
    <CloseButton
      size={"xs"}
      me="-2"
      onClick={() => {
        setSearchValue("");
        inputRef.current?.focus();
      }}
    />
  );
  const placeholder =
    searchMode === "filter"
      ? "Filter collections by id or title"
      : searchMode === "search"
        ? "Search collections"
        : "Search collections with natural language";

  useEffect(() => {
    if (searchMode === "filter") {
      setFilteredCollections(
        collections?.filter(
          (collection) =>
            matchesFilter(collection, searchValue) &&
            (!filterViewport || !bbox || isCollectionInBbox(collection, bbox))
        ) || null
      );
    }
  }, [
    collections,
    setFilteredCollections,
    setSearchValue,
    searchMode,
    searchValue,
    bbox,
    filterViewport,
  ]);

  return (
    <Stack gap={4}>
      <InputGroup
        startElement={startElement}
        endElement={searchValue && endElement}
      >
        <Input
          placeholder={placeholder}
          ref={inputRef}
          value={searchValue}
          onChange={(e) => setSearchValue(e.currentTarget.value)}
        />
      </InputGroup>
      <Checkbox.Root
        onCheckedChange={(e) => setFilterViewport(!!e.checked)}
        checked={filterViewport}
        size={"sm"}
      >
        <Checkbox.HiddenInput />
        <Checkbox.Control />
        <Checkbox.Label>Filter by viewport</Checkbox.Label>
      </Checkbox.Root>
    </Stack>
  );
}

function CollectionValues({
  listOrCard,
  hasNextPage,
  fetchNextPage,
  isFetching,
}: { listOrCard: ListOrCard } & UseInfiniteQueryResult) {
  const collections = useStore((store) => store.collections);
  const filteredCollections = useStore((store) => store.filteredCollections);
  const values = (filteredCollections || collections)?.map((collection) =>
    listOrCard === "list" ? (
      <ValueListItem key={collection.id} value={collection} />
    ) : (
      <CollectionCard key={collection.id} collection={collection} />
    )
  );
  if (listOrCard === "list") {
    return (
      <List.Root variant={"plain"} gap={2}>
        {values}
        {isFetching && (
          <List.Item>
            <SkeletonText />
          </List.Item>
        )}
        {hasNextPage && !isFetching && (
          <Center>
            <List.Item>
              <Link onClick={() => fetchNextPage()}>Load more...</Link>
            </List.Item>
          </Center>
        )}
      </List.Root>
    );
  } else {
    return (
      <Stack>
        {values}
        {isFetching && <SkeletonText />}
        {hasNextPage && (
          <Center>
            <Button
              variant={"plain"}
              disabled={isFetching}
              onClick={() => fetchNextPage()}
            >
              Load more...
            </Button>
          </Center>
        )}
      </Stack>
    );
  }
}

function CollectionCard({ collection }: { collection: StacCollection }) {
  const hoveredCollection = useStore((store) => store.hoveredCollection);
  const setHoveredCollection = useStore((store) => store.setHoveredCollection);

  return (
    <ValueCard
      value={collection}
      hovered={hoveredCollection === collection}
      onMouseEnter={() => setHoveredCollection(collection)}
      onMouseLeave={() => {
        if (hoveredCollection === collection) setHoveredCollection(null);
      }}
    />
  );
}

function CollectionActionBar({
  fetchAllCollections,
  setFetchAllCollections,
  data,
  hasNextPage,
  isFetching,
  fetchNextPage,
}: {
  fetchAllCollections: boolean;
  setFetchAllCollections: Dispatch<SetStateAction<boolean>>;
} & UseInfiniteQueryResult<InfiniteData<StacCollections | null>>) {
  const collections = useStore((store) => store.collections);
  const numberMatched = data?.pages.at(0)?.numberMatched;

  return (
    <ActionBar.Root open={!!collections}>
      <Portal>
        <ActionBar.Positioner>
          <ActionBar.Content>
            {collections && (
              <ActionBar.SelectionTrigger>
                {numberMatched && numberMatched > collections.length
                  ? `${collections.length}/${numberMatched}`
                  : collections.length}{" "}
                collection{collections.length != 1 && "s"} fetched
              </ActionBar.SelectionTrigger>
            )}
            {hasNextPage && (
              <>
                <ActionBar.Separator />
                <ButtonGroup variant="outline" size="sm">
                  <Button
                    onClick={() => fetchNextPage()}
                    disabled={isFetching || fetchAllCollections}
                  >
                    <LuForward />
                    Fetch next page
                  </Button>
                  <Button
                    onClick={() =>
                      setFetchAllCollections((previous) => !previous)
                    }
                  >
                    {fetchAllCollections ? <LuPause /> : <LuPlay />}
                    {fetchAllCollections && hasNextPage ? "Pause" : "Fetch all"}
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

function matchesFilter(collection: StacCollection, filter: string) {
  const lowerCaseFilter = filter.toLowerCase();
  return (
    collection.id.toLowerCase().includes(lowerCaseFilter) ||
    collection.title?.toLowerCase().includes(lowerCaseFilter)
  );
}
