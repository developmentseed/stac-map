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
  LuList,
  LuPause,
  LuPlay,
  LuSearch,
  LuSearchCode,
  LuSquare,
} from "react-icons/lu";
import { MarkdownHooks } from "react-markdown";
import {
  ActionBar,
  Box,
  Button,
  ButtonGroup,
  Card,
  Center,
  CloseButton,
  Heading,
  HStack,
  Input,
  InputGroup,
  Link,
  List,
  Portal,
  SegmentGroup,
  SkeletonText,
  Stack,
} from "@chakra-ui/react";
import {
  type InfiniteData,
  useInfiniteQuery,
  type UseInfiniteQueryResult,
} from "@tanstack/react-query";
import type { StacCollection } from "stac-ts";
import Thumbnail from "./thumbnail";
import { Prose } from "./ui/prose";
import { toaster } from "./ui/toaster";
import { useStore } from "../store";
import type { StacCollections } from "../types/stac";
import { getStacValueTitle } from "../utils/stac";
import { getSelfHref, getThumbnailAsset } from "../utils/stac";

export default function Collections({ href }: { href: string }) {
  const setCollections = useStore((state) => state.setCollections);
  const [fetchAllCollections, setFetchAllCollections] = useState(false);
  const [listOrCard, setListOrCard] = useState("card");

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
      lastPage?.links?.find((link) => link.rel == "next")?.href,
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
      <Stack gap={4}>
        <Header
          listOrCard={listOrCard}
          setListOrCard={setListOrCard}
          {...result}
        />
        <CollectionSearch />
        <CollectionValues listOrCard={listOrCard} {...result} />
      </Stack>

      <CollectionActionBar
        fetchAllCollections={fetchAllCollections}
        setFetchAllCollections={setFetchAllCollections}
        {...result}
      />
    </>
  );
}

function Header({
  listOrCard,
  setListOrCard,
}: {
  listOrCard: string;
  setListOrCard: (listOrCard: string) => void;
}) {
  const collections = useStore((store) => store.collections);
  const filteredCollections = useStore((store) => store.filteredCollections);

  return (
    <HStack>
      <Heading size={"md"}>
        <HStack>
          <LuFolderPlus /> Collections{" "}
          {collections &&
            `(${filteredCollections ? filteredCollections.length + "/" : ""}${collections.length})`}
        </HStack>
      </Heading>
      <Box flex={1} />
      <SegmentGroup.Root
        value={listOrCard}
        onValueChange={(e) => setListOrCard(e.value || "card")}
        size={"xs"}
      >
        <SegmentGroup.Indicator />
        <SegmentGroup.Items
          items={[
            { value: "list", label: <LuList /> },
            { value: "card", label: <LuSquare /> },
          ]}
        />
      </SegmentGroup.Root>
    </HStack>
  );
}

function CollectionSearch() {
  const collections = useStore((store) => store.collections);
  const setFilteredCollections = useStore(
    (store) => store.setFilteredCollections
  );
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [value, setValue] = useState("");
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
        setValue("");
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
        collections?.filter((collection) => matchesFilter(collection, value)) ||
          null
      );
    }
  }, [searchMode, collections, setFilteredCollections, value]);

  return (
    <InputGroup startElement={startElement} endElement={value && endElement}>
      <Input
        placeholder={placeholder}
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.currentTarget.value)}
      />
    </InputGroup>
  );
}

function CollectionValues({
  listOrCard,
  hasNextPage,
  fetchNextPage,
  isFetching,
}: { listOrCard: string } & UseInfiniteQueryResult) {
  const collections = useStore((store) => store.collections);
  const filteredCollections = useStore((store) => store.filteredCollections);
  const values = (filteredCollections || collections)?.map((collection) =>
    listOrCard === "list" ? (
      <CollectionListItem key={collection.id} collection={collection} />
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
  const href = getSelfHref(collection);
  const setHref = useStore((store) => store.setHref);
  const thumbnailAsset = getThumbnailAsset(collection);

  return (
    <Card.Root>
      <Card.Header>
        <Card.Title>
          <Link onClick={() => href && setHref(href)}>{collection.title}</Link>
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <Card.Description>
          {thumbnailAsset && <Thumbnail asset={thumbnailAsset} />}
          <Prose lineClamp={5}>
            <MarkdownHooks>{collection.description}</MarkdownHooks>
          </Prose>
        </Card.Description>
      </Card.Body>
    </Card.Root>
  );
}

function CollectionListItem({ collection }: { collection: StacCollection }) {
  const href = getSelfHref(collection);
  const setHref = useStore((store) => store.setHref);

  return (
    <List.Item>
      <Link onClick={() => href && setHref(href)}>
        {getStacValueTitle(collection)}
      </Link>
    </List.Item>
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
    collection.title?.includes(lowerCaseFilter)
  );
}
