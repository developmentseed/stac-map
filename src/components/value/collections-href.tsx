import { Section } from "@/components/section";
import {
  ActionBar,
  Button,
  ButtonGroup,
  HStack,
  IconButton,
  Portal,
  Progress,
  SkeletonText,
  Span,
} from "@chakra-ui/react";
import {
  useInfiniteQuery,
  type UseInfiniteQueryResult,
} from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  LuFolderSymlink,
  LuForward,
  LuLoader,
  LuPause,
  LuPlay,
} from "react-icons/lu";
import type { StacCollection } from "stac-ts";
import { useStore } from "../../store";
import type { StacCollections } from "../../types/stac";
import { getLinkHref } from "../../utils/stac";
import { ErrorAlert } from "../ui/error-alert";

export default function CollectionsHref({ href }: { href: string }) {
  const collections = useStore((state) => state.collections);
  const collectionFreeTextSearch = useStore(
    (store) => store.collectionFreeTextSearch
  );
  const setCollections = useStore((state) => state.setCollections);
  const [fetchAllCollections, setFetchAllCollections] = useState(false);

  const searchHref = useMemo(() => {
    const url = new URL(href);
    if (collectionFreeTextSearch)
      url.searchParams.set("q", collectionFreeTextSearch);
    return url.toString();
  }, [href, collectionFreeTextSearch]);

  const result = useInfiniteQuery({
    queryKey: ["stac-collections", searchHref],
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
    initialPageParam: searchHref,
    getNextPageParam: (lastPage: StacCollections | null) =>
      lastPage ? getLinkHref(lastPage, "next") : undefined,
  });

  useEffect(() => {
    if (fetchAllCollections && !result.isFetching && result.hasNextPage)
      result.fetchNextPage();
  }, [fetchAllCollections, result]);

  useEffect(() => {
    setCollections(
      result.data?.pages.flatMap(
        (collections) => collections?.collections || []
      ) || null
    );
  }, [result.data, setCollections]);

  const numberMatched = useMemo(() => {
    return result.data?.pages.at(0)?.numberMatched;
  }, [result.data]);

  if (result.error)
    return (
      <ErrorAlert
        title="Error while fetching collections"
        error={result.error}
      />
    );
  else if (collections && result.hasNextPage)
    return (
      <PagedCollections
        collections={collections}
        numberMatched={numberMatched}
        fetchAllCollections={fetchAllCollections}
        setFetchAllCollections={setFetchAllCollections}
        {...result}
      />
    );
  else if (result.isFetching) return <SkeletonText />;
}

function PagedCollections({
  collections,
  numberMatched,
  fetchAllCollections,
  setFetchAllCollections,
  fetchNextPage,
  hasNextPage,
  isFetching,
}: {
  collections: StacCollection[];
  numberMatched: number | undefined;
  fetchAllCollections: boolean;
  setFetchAllCollections: (fetch: boolean) => void;
} & UseInfiniteQueryResult) {
  return (
    <>
      <Section icon={<LuFolderSymlink />} title="Collection pagination">
        <HStack width={"full"}>
          {numberMatched ? (
            <Progress.Root
              width={"full"}
              value={collections.length}
              max={numberMatched}
              striped={hasNextPage}
              animated={fetchAllCollections || isFetching}
            >
              <Progress.Track>
                <Progress.Range />
              </Progress.Track>
            </Progress.Root>
          ) : (
            <Span width={"full"}>
              {collections.length} collection
              {collections.length === 1 ? "" : "s"} found
            </Span>
          )}
          <ButtonGroup variant={"subtle"} size={"sm"}>
            <IconButton
              onClick={() => fetchNextPage()}
              disabled={isFetching || fetchAllCollections}
            >
              {isFetching ? <LuLoader /> : <LuForward />}
            </IconButton>
            <IconButton
              onClick={() => setFetchAllCollections(!fetchAllCollections)}
            >
              {fetchAllCollections && hasNextPage ? <LuPause /> : <LuPlay />}
            </IconButton>
          </ButtonGroup>
        </HStack>
      </Section>
      <PagedCollectionsActionBar
        collections={collections}
        numberMatched={numberMatched}
        fetchAllCollections={fetchAllCollections}
        setFetchAllCollections={setFetchAllCollections}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetching={isFetching}
      />
    </>
  );
}

function PagedCollectionsActionBar({
  collections,
  numberMatched,
  fetchAllCollections,
  setFetchAllCollections,
  fetchNextPage,
  hasNextPage,
  isFetching,
}: {
  collections: StacCollection[];
  numberMatched: number | undefined;
  fetchAllCollections: boolean;
  setFetchAllCollections: (fetch: boolean) => void;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetching: boolean;
}) {
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
                    onClick={() => setFetchAllCollections(!fetchAllCollections)}
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
