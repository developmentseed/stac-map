import { type BBox2D, useStore } from "@/store";
import { getItemsDatetimeExtent, itemMatchesFilter } from "@/utils/datetime";
import { fitBoundsToBbox } from "@/utils/map";
import { fetchStacValue, getSelfHref } from "@/utils/stac";
import {
  Button,
  ButtonGroup,
  Checkbox,
  CloseButton,
  DownloadTrigger,
  Input,
  InputGroup,
  Stack,
} from "@chakra-ui/react";
import { GeoJsonLayer } from "@deck.gl/layers";
import { useQueries } from "@tanstack/react-query";
import type { Feature } from "geojson";
import { useEffect, useMemo, useState } from "react";
import { LuDownload, LuFiles, LuLocate, LuSearch } from "react-icons/lu";
import { useMap } from "react-map-gl/maplibre";
import type { StacItem, StacLink } from "stac-ts";
import * as stac_wasm from "stac-wasm";
import ItemCard from "./cards/item";
import ItemListItem from "./list-items/item";
import EntityList from "./ui/entity-list";
import Section from "./ui/section";

export function Items({ items }: { items: StacItem[] }) {
  const [filterByMapBbox, setFilterByMapBbox] = useState(true);
  const [filterText, setFilterText] = useState("");
  const [hovered, setHovered] = useState<StacItem>();
  const setHref = useStore((store) => store.setHref);
  const setLayer = useStore((store) => store.setLayer);
  const fillColor = useStore((store) => store.fillColor);
  const lineColor = useStore((store) => store.lineColor);
  const mapBbox = useStore((store) => store.mapBbox);
  const datetimeFilter = useStore((store) =>
    store.href ? store.datetimeFilters[store.href] : undefined
  );
  const setDatetimeExtent = useStore((store) => store.setDatetimeExtent);
  const { map } = useMap();

  useEffect(() => {
    setDatetimeExtent("items", getItemsDatetimeExtent(items));
    return () => setDatetimeExtent("items", null);
  }, [items, setDatetimeExtent]);

  const filteredItems = useMemo(() => {
    const needle = filterText.trim().toLowerCase();
    return items.filter((item) => {
      if (filterByMapBbox && mapBbox && !isItemInBbox(item, mapBbox)) {
        return false;
      }
      if (datetimeFilter && !itemMatchesFilter(item, datetimeFilter)) {
        return false;
      }
      if (needle) {
        const id = item.id?.toLowerCase() ?? "";
        const title =
          (item.properties?.title as string | undefined)?.toLowerCase() ?? "";
        if (!id.includes(needle) && !title.includes(needle)) return false;
      }
      return true;
    });
  }, [items, filterByMapBbox, mapBbox, filterText, datetimeFilter]);

  const itemsBbox = useMemo(() => getItemsBbox(filteredItems), [filteredItems]);

  useEffect(() => {
    setLayer(
      "items",
      new GeoJsonLayer({
        id: "items",
        data: filteredItems as Feature[],
        filled: true,
        getFillColor: (e: Feature) =>
          e.id === hovered?.id ? fillColor : [0, 0, 0, 0],
        getLineColor: lineColor,
        getLineWidth: 2,
        lineWidthUnits: "pixels",
        pickable: true,
        onClick: (e) => {
          const item: StacItem | undefined =
            e.object && filteredItems.find((item) => item.id === e.object?.id);
          const href = item && getSelfHref(item);
          if (href) setHref(href);
        },
        onHover: (e) => {
          if (e.object)
            setHovered(filteredItems.find((item) => item.id === e.object.id));
          else setHovered(undefined);
        },
        updateTriggers: {
          getFillColor: [fillColor, hovered],
        },
      })
    );

    return () => setLayer("items", undefined);
  }, [setLayer, fillColor, hovered, lineColor, filteredItems, setHref]);

  const filters = (
    <>
      <Checkbox.Root
        size={"sm"}
        checked={filterByMapBbox}
        onCheckedChange={(e) => setFilterByMapBbox(!!e.checked)}
      >
        <Checkbox.HiddenInput />
        <Checkbox.Control />
        <Checkbox.Label>Filter by map bounding box</Checkbox.Label>
      </Checkbox.Root>
      <InputGroup
        startElement={<LuSearch />}
        endElement={
          filterText && (
            <CloseButton
              size={"xs"}
              variant={"plain"}
              onClick={() => setFilterText("")}
            />
          )
        }
      >
        <Input
          size={"sm"}
          placeholder={"Filter by id or title"}
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
      </InputGroup>
    </>
  );

  return (
    <Section icon={<LuFiles />} title="Items">
      <Stack>
        <ButtonGroup size={"xs"} variant={"surface"}>
          <Button
            disabled={!map || !itemsBbox}
            onClick={() => map && itemsBbox && fitBoundsToBbox(map, itemsBbox)}
          >
            <LuLocate /> Zoom to extent
          </Button>
          <DownloadTrigger
            fileName="items.geojson"
            mimeType="application/json"
            data={() =>
              JSON.stringify({
                type: "FeatureCollection",
                features: items,
              })
            }
            asChild
          >
            <Button>
              <LuDownload /> JSON
            </Button>
          </DownloadTrigger>
          <DownloadTrigger
            fileName="items.parquet"
            mimeType="application/vnd.apache.parquet"
            data={() =>
              new Blob([stac_wasm.stacJsonToParquet(items) as BlobPart])
            }
            asChild
          >
            <Button>
              <LuDownload /> stac-geoparquet
            </Button>
          </DownloadTrigger>
        </ButtonGroup>
        <EntityList
          items={filteredItems}
          getKey={(item) => item.id}
          renderCard={(item) => (
            <ItemCard item={item} hovered={hovered} setHovered={setHovered} />
          )}
          renderListItem={(item) => (
            <ItemListItem
              item={item}
              hovered={hovered}
              setHovered={setHovered}
            />
          )}
          filters={filters}
          defaultView={"list"}
        />
      </Stack>
    </Section>
  );
}

export function ItemLinks({ links }: { links: StacLink[] }) {
  const results = useQueries({
    queries: links.map((link) => ({
      queryKey: ["stac-value", link.href],
      queryFn: async () => fetchStacValue({ href: link.href }),
    })),
  });

  const items = useMemo(() => {
    return results.flatMap((result) => (result.data ? [result.data] : []));
  }, [results]);

  return items.length > 0 ? <Items items={items} /> : null;
}

function getItemsBbox(items: StacItem[]): BBox2D | undefined {
  let west = Infinity;
  let south = Infinity;
  let east = -Infinity;
  let north = -Infinity;
  for (const item of items) {
    const b = item.bbox;
    if (!b || b.length < 4) continue;
    if (b[0] < west) west = b[0];
    if (b[1] < south) south = b[1];
    if (b[2] > east) east = b[2];
    if (b[3] > north) north = b[3];
  }
  if (west === Infinity) return undefined;
  return [west, south, east, north];
}

function isItemInBbox(item: StacItem, bbox: BBox2D): boolean {
  const itemBbox = item.bbox as BBox2D | undefined;
  if (!itemBbox) return false;
  if (bbox[2] - bbox[0] >= 360) return true;
  return !(
    itemBbox[0] > bbox[2] ||
    itemBbox[1] > bbox[3] ||
    itemBbox[2] < bbox[0] ||
    itemBbox[3] < bbox[1]
  );
}
