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
  Alert,
  Button,
  ButtonGroup,
  Checkbox,
  CloseButton,
  Dialog,
  Field,
  Fieldset,
  HStack,
  IconButton,
  Input,
  NumberInput,
  Portal,
  Progress,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { StacCollection } from "stac-ts";
import type { BBox } from "geojson";
import { useStore } from "../store/index.ts";
import type { StacItemCollection, StacSearch } from "../types/stac";
import { sanitizeBbox } from "../utils/map.ts";
import { fetchStac, getLinkHref } from "../utils/stac.ts";

interface Props {
  href: string;
  collection: StacCollection;
}

interface SearchSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collectionId: string;
  useViewportForBbox: boolean;
  onUseViewportForBboxChange: (checked: boolean) => void;
  limit: string | undefined;
  onLimitChange: (value: string) => void;
}

function SearchSettingsDialog({
  open,
  onOpenChange,
  collectionId,
  useViewportForBbox,
  onUseViewportForBboxChange,
  limit,
  onLimitChange,
}: SearchSettingsDialogProps) {
  return (
    <Dialog.Root
      lazyMount
      unmountOnExit
      open={open}
      onOpenChange={(e) => onOpenChange(e.open)}
    >
      <Dialog.Trigger asChild>
        <Button variant={"plain"} disabled={false}>
          <LuSettings />
          Configure
        </Button>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content
            onKeyDown={(e) => {
              if (e.key === "Enter") onOpenChange(false);
            }}
          >
            <Dialog.Header>
              <Dialog.Title>Search settings</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Fieldset.Root>
                <Fieldset.Content>
                  <Field.Root>
                    <Field.Label>Collection</Field.Label>
                    <Input value={collectionId} disabled={true} />
                  </Field.Root>

                  <Field.Root>
                    <Field.Label>BBox</Field.Label>
                    <Checkbox.Root
                      checked={useViewportForBbox}
                      onCheckedChange={(e) =>
                        onUseViewportForBboxChange(!!e.checked)
                      }
                    >
                      <Checkbox.HiddenInput />
                      <Checkbox.Control />
                      <Checkbox.Label>
                        Use viewport bounding box?
                      </Checkbox.Label>
                    </Checkbox.Root>
                  </Field.Root>

                  <Field.Root>
                    <Field.Label>Limit</Field.Label>
                    <NumberInput.Root
                      value={limit}
                      onValueChange={(e) => onLimitChange(e.value)}
                    >
                      <NumberInput.Control />
                      <NumberInput.Input />
                    </NumberInput.Root>
                  </Field.Root>
                </Fieldset.Content>
              </Fieldset.Root>
            </Dialog.Body>
            <Dialog.Footer>
              <Button onClick={() => onOpenChange(false)}>Close</Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <CloseButton size={"sm"} />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

interface SearchResultsProgressProps {
  itemCount: number | undefined;
  numberMatched: number | undefined;
  hasNextPage: boolean;
  isFetching: boolean;
  fetchAllItems: boolean;
  onFetchNextPage: () => void;
  onFetchAllToggle: (value: boolean) => void;
}

function SearchResultsProgress({
  itemCount,
  numberMatched,
  hasNextPage,
  isFetching,
  fetchAllItems,
  onFetchNextPage,
  onFetchAllToggle,
}: SearchResultsProgressProps) {
  if (itemCount === 0 && !hasNextPage) {
    return (
      <Alert.Root status={"warning"}>
        <Alert.Indicator />
        <Alert.Title>No results found</Alert.Title>
      </Alert.Root>
    );
  }

  return (
    <HStack mx={2}>
      {numberMatched ? (
        <Progress.Root value={itemCount} max={numberMatched} width="full">
          <Progress.Track>
            <Progress.Range />
          </Progress.Track>
        </Progress.Root>
      ) : (
        <Text>
          Found {itemCount ?? 0} item
          {itemCount != 1 && "s"}
        </Text>
      )}
      <ButtonGroup size="2xs" variant="plain">
        <IconButton
          onClick={onFetchNextPage}
          disabled={!hasNextPage || isFetching}
        >
          <LuForward />
        </IconButton>
        {fetchAllItems ? (
          <IconButton
            onClick={() => onFetchAllToggle(false)}
            disabled={!hasNextPage}
          >
            <LuPause />
          </IconButton>
        ) : (
          <IconButton
            onClick={() => onFetchAllToggle(true)}
            disabled={!hasNextPage}
          >
            <LuPlay />
          </IconButton>
        )}
      </ButtonGroup>
    </HStack>
  );
}

interface SearchResultsActionBarProps {
  itemCount: number | undefined;
  numberMatched: number | undefined;
  hasNextPage: boolean;
  isFetching: boolean;
  fetchAllItems: boolean;
  onFetchNextPage: () => void;
  onFetchAllToggle: () => void;
}

function SearchResultsActionBar({
  itemCount,
  numberMatched,
  hasNextPage,
  isFetching,
  fetchAllItems,
  onFetchNextPage,
  onFetchAllToggle,
}: SearchResultsActionBarProps) {
  return (
    <ActionBar.Root open={!!itemCount}>
      <Portal>
        <ActionBar.Positioner>
          <ActionBar.Content>
            <ActionBar.SelectionTrigger>
              {itemCount}
              {numberMatched && "/" + numberMatched} item
              {itemCount != 1 && "s"} fetched
            </ActionBar.SelectionTrigger>
            {hasNextPage && (
              <>
                <ActionBar.Separator />
                <ButtonGroup variant="outline" size="sm">
                  <Button
                    onClick={onFetchNextPage}
                    disabled={isFetching || fetchAllItems}
                  >
                    <LuForward />
                    Fetch next page
                  </Button>
                  <Button onClick={onFetchAllToggle}>
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

function SearchResults({ href, search }: { href: string; search: StacSearch }) {
  const searchItems = useStore((store) => store.searchItems);
  const setSearchItems = useStore((store) => store.setSearchItems);
  const [fetchAllItems, setFetchAllItems] = useState(false);

  const url = useMemo(() => {
    return new URL(href);
  }, [href]);

  url.searchParams.set("collections", search.collections.join(","));
  if (search.bbox) url.searchParams.set("bbox", search.bbox.join(","));
  if (search.limit) url.searchParams.set("limit", search.limit.toFixed(0));

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
      <SearchResultsProgress
        itemCount={searchItems?.length}
        numberMatched={numberMatched}
        hasNextPage={result.hasNextPage}
        isFetching={result.isFetching}
        fetchAllItems={fetchAllItems}
        onFetchNextPage={() => result.fetchNextPage()}
        onFetchAllToggle={setFetchAllItems}
      />
      <SearchResultsActionBar
        itemCount={searchItems?.length}
        numberMatched={numberMatched}
        hasNextPage={result.hasNextPage}
        isFetching={result.isFetching}
        fetchAllItems={fetchAllItems}
        onFetchNextPage={() => result.fetchNextPage()}
        onFetchAllToggle={() => setFetchAllItems((previous) => !previous)}
      />
    </>
  );
}

export default function Search({ href, collection }: Props) {
  const search = useStore((store) => store.search);
  const setSearch = useStore((store) => store.setSearch);
  const [searchSettingsOpen, setSearchSettingsOpen] = useState(false);
  const [useViewportForBbox, setUseViewportForBbox] = useState(true);
  const [limit, setLimit] = useState<string>();
  const { map } = useMap();

  return (
    <Stack gap={4}>
      <HStack>
        {!search && (
          <SearchSettingsDialog
            open={searchSettingsOpen}
            onOpenChange={setSearchSettingsOpen}
            collectionId={collection.id}
            useViewportForBbox={useViewportForBbox}
            onUseViewportForBboxChange={setUseViewportForBbox}
            limit={limit}
            onLimitChange={setLimit}
          />
        )}

        {search ? (
          <Button
            onClick={() => {
              setSearch(null);
            }}
            variant={"surface"}
          >
            <LuX /> Clear
          </Button>
        ) : (
          <Button
            onClick={() => {
              setSearch({
                collections: [collection.id],
                bbox: useViewportForBbox
                  ? sanitizeBbox(map?.getBounds().toArray().flat() as BBox)
                  : undefined,
                limit: Number(limit),
              });
            }}
          >
            <LuSearch />
            Search
          </Button>
        )}
      </HStack>

      {search && <SearchResults href={href} search={search} />}
    </Stack>
  );
}
