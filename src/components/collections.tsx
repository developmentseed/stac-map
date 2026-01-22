import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import { LuFolderPlus, LuForward, LuPause, LuPlay } from "react-icons/lu";
import {
  ActionBar,
  Button,
  ButtonGroup,
  Center,
  HStack,
  IconButton,
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
import CollectionSearch from "./collection-search";
import { type ListOrCard, Section } from "./section";
import ValueCard from "./value-card";
import ValueListItem from "./value-list-item";
import { useStore } from "../store";
import type { StacCollections } from "../types/stac";
import { getLinkHref } from "../utils/stac";

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

  return (
    <>
      <Section
        icon={<LuFolderPlus />}
        title={
          <CollectionsTitle
            fetchAllCollections={fetchAllCollections}
            setFetchAllCollections={setFetchAllCollections}
            {...result}
          />
        }
        count={collections?.length}
        filteredCount={filteredCollections?.length}
      >
        {(listOrCard) => (
          <Stack gap={4}>
            <CollectionSearch />
            <CollectionValues listOrCard={listOrCard} {...result} />
          </Stack>
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

function CollectionsTitle({
  setFetchAllCollections,
  fetchAllCollections,
  hasNextPage,
  fetchNextPage,
  isFetching,
}: {
  setFetchAllCollections: (fetchAllCollections: boolean) => void;
  fetchAllCollections: boolean;
} & UseInfiniteQueryResult) {
  if (hasNextPage) {
    return (
      <HStack>
        Collections
        <ButtonGroup size={"2xs"} variant={"plain"}>
          <IconButton disabled={isFetching} onClick={() => fetchNextPage()}>
            <LuForward />
          </IconButton>
          <IconButton>
            {(fetchAllCollections && (
              <LuPause onClick={() => setFetchAllCollections(false)} />
            )) || <LuPlay onClick={() => setFetchAllCollections(true)} />}
          </IconButton>
        </ButtonGroup>
      </HStack>
    );
  } else {
    return "Collections";
  }
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
      <ValueCard key={collection.id} value={collection} />
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
