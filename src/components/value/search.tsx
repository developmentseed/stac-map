import { Section } from "@/components/section";
import { useStore } from "@/store/index.ts";
import { formatBbox } from "@/utils/map";
import { Button, DataList, HStack, Stack } from "@chakra-ui/react";
import { useState } from "react";
import { LuSearch } from "react-icons/lu";
import type { StacCollection } from "stac-ts";
import SearchResults from "../search/results";
import SearchSettings from "../search/settings";

interface Props {
  href: string;
  collection: StacCollection;
  queryablesHref: string | undefined;
}

export default function Search({ href, collection, queryablesHref }: Props) {
  const bbox = useStore((store) => store.bbox);
  const search = useStore((store) => store.search);
  const setSearch = useStore((store) => store.setSearch);
  const [useViewportForBbox, setUseViewportForBbox] = useState(true);
  const [limit, setLimit] = useState<string>();
  const [queryables, setQueryables] = useState(null);

  const onClickSearch = () => {
    setSearch({
      collections: [collection.id],
      bbox: useViewportForBbox && bbox ? bbox : undefined,
      limit: Number(limit),
      queryables,
    });
  };

  return (
    <Section icon={<LuSearch />} title="Item search">
      {search ? (
        <SearchResults href={href} search={search} />
      ) : (
        <Stack gap={4}>
          <HStack>
            <Button onClick={onClickSearch}>
              <LuSearch />
              Search
            </Button>
            <SearchSettings
              collection={collection}
              useViewportForBbox={useViewportForBbox}
              setUseViewportForBbox={setUseViewportForBbox}
              limit={limit}
              setLimit={setLimit}
              disabled={!!search}
              queryablesHref={queryablesHref}
              queryables={queryables}
              setQueryables={setQueryables}
            />
          </HStack>
          <DataList.Root
            variant={"subtle"}
            orientation={"horizontal"}
            size={"sm"}
          >
            {useViewportForBbox && bbox && (
              <DataList.Item>
                <DataList.ItemLabel>bbox</DataList.ItemLabel>
                <DataList.ItemValue>{formatBbox(bbox)}</DataList.ItemValue>
              </DataList.Item>
            )}
            <DataList.Item>
              <DataList.ItemLabel>limit</DataList.ItemLabel>
              <DataList.ItemValue>{limit || "—"}</DataList.ItemValue>
            </DataList.Item>
            {queryables &&
              Object.entries(queryables).map(([key, value]) => (
                <DataList.Item key={key}>
                  <DataList.ItemLabel>{key}</DataList.ItemLabel>
                  <DataList.ItemValue>{String(value)}</DataList.ItemValue>
                </DataList.Item>
              ))}
          </DataList.Root>
        </Stack>
      )}
    </Section>
  );
}
