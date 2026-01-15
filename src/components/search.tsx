import { useEffect, useState } from "react";
import { LuSearch, LuSettings, LuX } from "react-icons/lu";
import { useMap } from "react-map-gl/maplibre";
import {
  Button,
  ButtonGroup,
  Card,
  Link,
  List,
  SkeletonText,
  Stack,
} from "@chakra-ui/react";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { StacCollection, StacItem } from "stac-ts";
import type { BBox } from "geojson";
import SectionHeader, { type ListOrCard } from "./section-header";
import { useStore } from "../store.ts";
import type { StacItemCollection, StacSearch } from "../types/stac";
import { sanitizeBbox } from "../utils/map.ts";
import {
  fetchStac,
  getLinkHref,
  getSelfHref,
  getStacValueTitle,
} from "../utils/stac.ts";

interface Props {
  href: string;
  collection: StacCollection;
}

export default function Search({ href, collection }: Props) {
  const [listOrCard, setListOrCard] = useState<ListOrCard>("list");
  const setSearchItems = useStore((store) => store.setSearchItems);
  const [search, setSearch] = useState<StacSearch | null>(null);
  const { map } = useMap();

  return (
    <Stack gap={4}>
      <SectionHeader
        icon={<LuSearch />}
        title="Item search"
        listOrCard={listOrCard}
        setListOrCard={setListOrCard}
      />

      <ButtonGroup>
        <Button variant={"outline"} disabled={!!search}>
          <LuSettings />
          Configure
        </Button>

        {search ? (
          <Button onClick={() => setSearch(null)} variant={"surface"}>
            <LuX /> Clear
          </Button>
        ) : (
          <Button
            onClick={() => {
              setSearchItems(null);
              setSearch({
                collections: [collection.id],
                bbox: sanitizeBbox(map?.getBounds().toArray().flat() as BBox),
              });
            }}
          >
            <LuSearch />
            Search
          </Button>
        )}
      </ButtonGroup>

      {search && (
        <SearchResults href={href} search={search} listOrCard={listOrCard} />
      )}
    </Stack>
  );
}

function SearchResults({
  href,
  search,
  listOrCard,
}: {
  href: string;
  search: StacSearch;
  listOrCard: ListOrCard;
}) {
  const searchItems = useStore((store) => store.searchItems);
  const setSearchItems = useStore((store) => store.setSearchItems);

  const url = new URL(href);
  if (search.collections)
    url.searchParams.set("collections", search.collections.join(","));
  if (search.bbox) url.searchParams.set("bbox", search.bbox.join(","));
  url.searchParams.set("sortby", "-datetime");
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

  useEffect(() => {
    if (result.data)
      setSearchItems(result.data.pages.flatMap((page) => page?.features || []));
  }, [result.data, setSearchItems]);

  return (
    <Stack>
      {searchItems && (
        <SearchItems listOrCard={listOrCard} items={searchItems} />
      )}

      {result.isFetching && <SkeletonText />}
    </Stack>
  );
}

function SearchItems({
  items,
  listOrCard,
}: {
  items: StacItem[];
  listOrCard: ListOrCard;
}) {
  if (listOrCard === "list") {
    return (
      <List.Root variant={"plain"}>
        {items.map((item) => (
          <ItemListItem key={item.id} item={item} />
        ))}
      </List.Root>
    );
  } else {
    return (
      <Stack>
        {items.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </Stack>
    );
  }
}

function ItemListItem({ item }: { item: StacItem }) {
  const setHref = useStore((state) => state.setHref);
  const selfHref = getSelfHref(item);

  return (
    <List.Item>
      <Link onClick={() => selfHref && setHref(selfHref)}>
        {getStacValueTitle(item)}
      </Link>
    </List.Item>
  );
}

function ItemCard({ item }: { item: StacItem }) {
  const setHref = useStore((state) => state.setHref);
  const selfHref = getSelfHref(item);

  return (
    <Card.Root size={"sm"}>
      <Card.Body>
        <Card.Title>
          <Link onClick={() => selfHref && setHref(selfHref)}>
            {getStacValueTitle(item)}
          </Link>
        </Card.Title>
      </Card.Body>
    </Card.Root>
  );
}
