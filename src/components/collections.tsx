import { useEffect, useRef, useState } from "react";
import {
  LuFolderPlus,
  LuForward,
  LuList,
  LuPause,
  LuPlay,
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
import { useInfiniteQuery } from "@tanstack/react-query";
import type { StacCollection } from "stac-ts";
import { Prose } from "./ui/prose";
import { toaster } from "./ui/toaster";
import { useStore } from "../store";
import type { StacCollections } from "../types/stac";
import { getSelfHref, getStacValueTitle } from "../utils/stac";

export default function Collections({ href }: { href: string }) {
  const collections = useStore((store) => store.collections);
  const setCollections = useStore((state) => state.setCollections);
  const filteredCollections = useStore((store) => store.filteredCollections);
  const setFilteredCollections = useStore(
    (state) => state.setFilteredCollections
  );
  const [fetchAllCollections, setFetchAllCollections] = useState(false);
  const [value, setValue] = useState("card");
  const [filter, setFilter] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

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

  const totalCollectionsCount = result.data?.pages.at(0)?.numberMatched;

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

  useEffect(() => {
    if (filter.length > 0 && collections) {
      setFilteredCollections(
        collections.filter((collection) => matchesFilter(collection, filter))
      );
    } else {
      setFilteredCollections(null);
    }
  }, [filter, collections, setFilteredCollections]);

  return (
    <>
      <Stack gap={4}>
        <Heading size={"md"}>
          <HStack>
            <LuFolderPlus /> Collections{" "}
            {collections &&
              `(${filteredCollections ? filteredCollections.length + "/" : ""}${collections.length})`}
            <Box flex={1} />
            <SegmentGroup.Root
              value={value}
              onValueChange={(e) => setValue(e.value || "card")}
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
        </Heading>
        {collections && (
          <InputGroup
            endElement={
              filter && (
                <CloseButton
                  size={"xs"}
                  me="-2"
                  onClick={() => {
                    setFilter("");
                    inputRef.current?.focus();
                  }}
                />
              )
            }
          >
            <Input
              placeholder="Filter collections by title or id"
              ref={inputRef}
              value={filter}
              onChange={(e) => setFilter(e.currentTarget.value)}
            />
          </InputGroup>
        )}
        {collections &&
          (value === "card" ? (
            <Stack>
              {(filteredCollections || collections).map((collection) => (
                <CollectionCard key={collection.id} collection={collection} />
              ))}
            </Stack>
          ) : (
            <List.Root variant={"plain"} gap={1}>
              {(filteredCollections || collections).map((collection) => (
                <CollectionListItem
                  key={collection.id}
                  collection={collection}
                />
              ))}
            </List.Root>
          ))}
        {result.isFetching && <SkeletonText />}
        {result.hasNextPage && (
          <Center>
            <Button
              variant={"outline"}
              onClick={() => result.fetchNextPage()}
              disabled={result.isFetching}
            >
              Load more...
            </Button>
          </Center>
        )}
      </Stack>
      <ActionBar.Root open={true}>
        <Portal>
          <ActionBar.Positioner>
            <ActionBar.Content>
              {collections && (
                <ActionBar.SelectionTrigger>
                  {totalCollectionsCount &&
                  totalCollectionsCount > collections.length
                    ? `${collections.length}/${totalCollectionsCount}`
                    : collections.length}{" "}
                  collection{collections.length != 1 && "s"} loaded
                </ActionBar.SelectionTrigger>
              )}
              {result.hasNextPage && (
                <>
                  <ActionBar.Separator />
                  <ButtonGroup variant="outline" size="sm">
                    <Button
                      onClick={() => result.fetchNextPage()}
                      disabled={!result.hasNextPage}
                    >
                      <LuForward />
                      Fetch next page
                    </Button>
                    <Button
                      onClick={() =>
                        setFetchAllCollections((previous) => !previous)
                      }
                      disabled={!result.hasNextPage}
                    >
                      {fetchAllCollections ? <LuPause /> : <LuPlay />}
                      {fetchAllCollections && result.hasNextPage
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

function CollectionCard({ collection }: { collection: StacCollection }) {
  const href = getSelfHref(collection);
  const setHref = useStore((store) => store.setHref);

  return (
    <Card.Root>
      <Card.Header>
        <Card.Title>
          <Link onClick={() => href && setHref(href)}>{collection.title}</Link>
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <Card.Description>
          <Prose>
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

function matchesFilter(collection: StacCollection, filter: string) {
  const lowerCaseFilter = filter.toLowerCase();
  return (
    collection.id.toLowerCase().includes(lowerCaseFilter) ||
    collection.title?.includes(lowerCaseFilter)
  );
}
