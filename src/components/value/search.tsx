import { Section } from "@/components/section";
import { useStacSearch } from "@/hooks/stac";
import { useItems } from "@/hooks/store";
import { useStore } from "@/store/index.ts";
import type { StacSearch } from "@/types/stac";
import { paddedBbox } from "@/utils/bbox";
import { Button, ButtonGroup, HStack, Progress, Stack } from "@chakra-ui/react";
import type { UseInfiniteQueryResult } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  LuFocus,
  LuForward,
  LuLoader,
  LuPause,
  LuPlay,
  LuSearch,
  LuX,
} from "react-icons/lu";
import type { StacCollection } from "stac-ts";
import { Json } from "../json";

interface Props {
  href: string;
  collection: StacCollection;
}

interface SetSearchParams {
  bbox?: [number, number, number, number];
}

export default function Search({ href, collection }: Props) {
  const search = useStore((store) => store.search);
  const setSearch = useStore((store) => store.setSearch);
  const setPagedItems = useStore((store) => store.setPagedItems);
  const result = useStacSearch({ href, search });

  const numberMatched = useMemo(() => {
    if (result.data) return result.data.pages.at(0)?.numberMatched;
  }, [result.data]);

  useEffect(() => {
    setSearch({ collections: [collection.id] });
  }, [collection, setSearch]);

  useEffect(() => {
    if (result.data)
      setPagedItems(result.data.pages.map((page) => page?.features || []));
  }, [result.data, setPagedItems]);

  return (
    <Section icon={<LuSearch />} title="Item search">
      <Stack gap={4}>
        <SearchControls
          setSearch={(params: SetSearchParams) =>
            setSearch({ ...search, collections: [collection.id], ...params })
          }
          resetSearch={() => setSearch({ collections: [collection.id] })}
          {...result}
        />
        {numberMatched && (
          <SearchProgress numberMatched={numberMatched} {...result} />
        )}
        <SearchDetails search={search} />
      </Stack>
    </Section>
  );
}

function SearchControls({
  setSearch,
  resetSearch,
  isFetching,
  fetchNextPage,
  hasNextPage,
}: {
  setSearch: (params: SetSearchParams) => void;
  resetSearch: () => void;
} & UseInfiniteQueryResult) {
  const [fetchAll, setFetchAll] = useState(false);
  const bbox = useStore((store) => store.bbox);

  useEffect(() => {
    if (fetchAll && !isFetching && hasNextPage) fetchNextPage();
  }, [fetchAll, isFetching, hasNextPage, fetchNextPage]);

  return (
    <Stack>
      <ButtonGroup size={"xs"} variant={"surface"} attached>
        <Button
          disabled={isFetching || fetchAll}
          onClick={() => fetchNextPage()}
        >
          {isFetching ? <LuLoader /> : <LuForward />}
          Next page
        </Button>
        <Button onClick={() => setFetchAll((previous) => !previous)}>
          {fetchAll ? <LuPause /> : <LuPlay />}
          {fetchAll ? "Pause" : "Fetch all"}
        </Button>
      </ButtonGroup>

      <ButtonGroup size={"xs"} variant={"outline"} attached>
        <Button
          onClick={() =>
            setSearch({ bbox: bbox ? paddedBbox(bbox) : undefined })
          }
        >
          <LuFocus />
          Set bbox to viewport
        </Button>
        <Button onClick={() => resetSearch()}>
          <LuX />
          Reset
        </Button>
      </ButtonGroup>
    </Stack>
  );
}

function SearchProgress({
  numberMatched,
  isFetching,
}: { numberMatched: number } & UseInfiniteQueryResult) {
  const items = useItems();

  return (
    <Progress.Root
      value={items?.length}
      max={numberMatched}
      animated={isFetching}
    >
      <HStack>
        <Progress.Track flex={1}>
          <Progress.Range />
        </Progress.Track>
        <Progress.ValueText />
      </HStack>
    </Progress.Root>
  );
}

function SearchDetails({ search }: { search: StacSearch }) {
  return <Json value={search}></Json>;
}
