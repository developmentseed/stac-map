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
  Span,
  Spinner,
} from "@chakra-ui/react";
import {
  useInfiniteQuery,
  type UseInfiniteQueryResult,
} from "@tanstack/react-query";
import type { BBox } from "geojson";
import { useEffect, useMemo, useState } from "react";
import {
  LuForward,
  LuLoader,
  LuPause,
  LuPlay,
  LuSearch,
  LuSettings,
  LuX,
} from "react-icons/lu";
import { useMap } from "react-map-gl/maplibre";
import type { StacCollection, StacItem } from "stac-ts";
import { useStore } from "../store/index.ts";
import type { StacItemCollection, StacSearch } from "../types/stac";
import { sanitizeBbox } from "../utils/map.ts";
import { fetchStac, getLinkHref } from "../utils/stac.ts";
import { Section } from "./section";

interface Props {
  href: string;
  collection: StacCollection;
}

interface SearchSettingsDialogProps {
  collection: StacCollection;
  useViewportForBbox: boolean;
  setUseViewportForBbox: (checked: boolean) => void;
  limit: string | undefined;
  setLimit: (value: string) => void;
  disabled: boolean;
}

function SearchSettingsDialog({
  collection,
  useViewportForBbox,
  setUseViewportForBbox,
  limit,
  setLimit,
  disabled,
}: SearchSettingsDialogProps) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog.Root
      lazyMount
      unmountOnExit
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
    >
      <Dialog.Trigger asChild>
        <IconButton variant={"subtle"} disabled={disabled}>
          <LuSettings />
        </IconButton>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content
            onKeyDown={(e) => {
              if (e.key === "Enter") setOpen(false);
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
                    <Input value={collection.id} disabled={true} />
                  </Field.Root>

                  <Field.Root>
                    <Field.Label>BBox</Field.Label>
                    <Checkbox.Root
                      checked={useViewportForBbox}
                      onCheckedChange={(e) =>
                        setUseViewportForBbox(!!e.checked)
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
                      onValueChange={(e) => setLimit(e.value)}
                    >
                      <NumberInput.Control />
                      <NumberInput.Input />
                    </NumberInput.Root>
                  </Field.Root>
                </Fieldset.Content>
              </Fieldset.Root>
            </Dialog.Body>
            <Dialog.Footer>
              <Button onClick={() => setOpen(false)}>Close</Button>
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

function SearchResults({ href, search }: { href: string; search: StacSearch }) {
  const searchItems = useStore((store) => store.searchItems);
  const setSearchItems = useStore((store) => store.setSearchItems);
  const [fetchAllItems, setFetchAllItems] = useState(false);

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
      setSearchItems(result.data.pages.flatMap((page) => page?.features || []));
  }, [result.data, setSearchItems]);

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
        items={searchItems}
        numberMatched={numberMatched}
        fetchAllItems={fetchAllItems}
        setFetchAllItems={setFetchAllItems}
        {...result}
      />
      <SearchResultsActionBar
        items={searchItems}
        numberMatched={numberMatched}
        fetchAllItems={fetchAllItems}
        setFetchAllItems={setFetchAllItems}
        {...result}
      />
    </>
  );
}

export default function Search({ href, collection }: Props) {
  const search = useStore((store) => store.search);
  const setSearch = useStore((store) => store.setSearch);
  const [useViewportForBbox, setUseViewportForBbox] = useState(true);
  const [limit, setLimit] = useState<string>();
  const { map } = useMap();

  const onClickSearch = () => {
    setSearch({
      collections: [collection.id],
      bbox: useViewportForBbox
        ? sanitizeBbox(map?.getBounds().toArray().flat() as BBox)
        : undefined,
      limit: Number(limit),
    });
  };

  return (
    <Section icon={<LuSearch />} title="Item search">
      <HStack>
        <SearchSettingsDialog
          collection={collection}
          useViewportForBbox={useViewportForBbox}
          setUseViewportForBbox={setUseViewportForBbox}
          limit={limit}
          setLimit={setLimit}
          disabled={!!search}
        />

        {search ? (
          <SearchResults href={href} search={search} />
        ) : (
          <Button onClick={onClickSearch}>
            <LuSearch />
            Search
          </Button>
        )}
      </HStack>
    </Section>
  );
}
