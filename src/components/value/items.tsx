import { useStore } from "@/store";
import type { ItemSource } from "@/store/items";
import type { StacValue } from "@/types/stac";
import { fitBounds } from "@/utils/map";
import { getLink } from "@/utils/stac";
import {
  Button,
  ButtonGroup,
  Center,
  DownloadTrigger,
  IconButton,
  List,
  SegmentGroup,
  Stack,
} from "@chakra-ui/react";
import {
  LuDownload,
  LuEye,
  LuEyeClosed,
  LuFiles,
  LuFocus,
  LuStepBack,
  LuStepForward,
} from "react-icons/lu";
import { useMap } from "react-map-gl/maplibre";
import type { StacItem } from "stac-ts";
import * as stac_wasm from "stac-wasm";
import ItemCard from "../cards/item";
import ItemListItem from "../list-items/item";
import { Section } from "../section";

export default function Items({
  items,
  value,
}: {
  items: StacItem[];
  value: StacValue;
}) {
  const visualizeItems = useStore((store) => store.visualizeItems);
  const setVisualizeItems = useStore((store) => store.setVisualizeItems);
  const staticItems = useStore((store) => store.staticItems);
  const searchedItems = useStore((store) => store.searchedItems);
  const itemSource = useStore((store) => store.itemSource);
  const setItemSource = useStore((store) => store.setItemSource);
  const projection = useStore((store) => store.projection);

  const hasStatic = staticItems && staticItems.length > 0;
  const hasSearched = searchedItems && searchedItems.length > 0;
  const hasBoth = hasStatic && hasSearched;

  const title = `Items (${items.length})`;
  const { map } = useMap();

  return (
    <Section
      defaultListOrCard="list"
      title={title}
      icon={<LuFiles />}
      headerAction={<HeaderAction value={value} />}
    >
      {(listOrCard) => {
        return (
          <Stack>
            {hasBoth && (
              <Center>
                <SegmentGroup.Root
                  size="xs"
                  value={itemSource}
                  onValueChange={(e) => setItemSource(e.value as ItemSource)}
                >
                  <SegmentGroup.Indicator />
                  <SegmentGroup.Item value="static">
                    <SegmentGroup.ItemText>Static</SegmentGroup.ItemText>
                    <SegmentGroup.ItemHiddenInput />
                  </SegmentGroup.Item>
                  <SegmentGroup.Item value="searched">
                    <SegmentGroup.ItemText>Searched</SegmentGroup.ItemText>
                    <SegmentGroup.ItemHiddenInput />
                  </SegmentGroup.Item>
                </SegmentGroup.Root>
              </Center>
            )}
            <Center>
              <ButtonGroup size="2xs" variant={"subtle"} attached>
                <Button
                  onClick={() =>
                    map &&
                    fitBounds(
                      map,
                      { type: "FeatureCollection", features: items },
                      null
                    )
                  }
                >
                  <LuFocus />
                  Zoom to extents
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
                  <Button disabled={items.length === 0}>
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
                  <Button disabled={items.length === 0}>
                    <LuDownload /> STAC GeoParquet
                  </Button>
                </DownloadTrigger>
              </ButtonGroup>
            </Center>
            <Button
              onClick={() => setVisualizeItems(!visualizeItems)}
              size={"xs"}
              variant={"ghost"}
              disabled={projection === "globe"}
            >
              {visualizeItems ? <LuEye /> : <LuEyeClosed />}
              {visualizeItems
                ? "Hide assets"
                : "Visualize assets (experimental)"}
            </Button>
            {listOrCard === "list" ? (
              <List.Root variant={"plain"}>
                {items.map((item) => (
                  <ItemListItem key={item.id} item={item} />
                ))}
              </List.Root>
            ) : (
              <Stack>
                {items.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </Stack>
            )}
          </Stack>
        );
      }}
    </Section>
  );
}

function HeaderAction({ value }: { value: StacValue }) {
  const setHref = useStore((store) => store.setHref);
  const collections = useStore((store) => store.collections);
  const hasCollections = collections && collections.length > 0;
  const visualizeItemBounds = useStore((store) => store.visualizeItemBounds);
  const setVisualizeItemBounds = useStore(
    (store) => store.setVisualizeItemBounds
  );

  const nextLink = getLink(value, "next");
  const prevLink = getLink(value, "prev") || getLink(value, "previous");

  const nextPrevButtons =
    nextLink || prevLink ? (
      <ButtonGroup attached variant={"outline"} size="2xs">
        <IconButton
          disabled={!prevLink}
          onClick={(e) => {
            e.stopPropagation();
            if (prevLink) setHref(prevLink.href);
          }}
        >
          <LuStepBack />
        </IconButton>
        <IconButton
          disabled={!nextLink}
          onClick={(e) => {
            e.stopPropagation();
            if (nextLink) setHref(nextLink.href);
          }}
        >
          <LuStepForward />
        </IconButton>
      </ButtonGroup>
    ) : undefined;

  const itemBoundsButton = hasCollections ? (
    <IconButton
      size="2xs"
      variant="ghost"
      aria-label={
        visualizeItemBounds
          ? "Hide item bounds on map"
          : "Show item bounds on map"
      }
      onClick={(e) => {
        e.stopPropagation();
        setVisualizeItemBounds(!visualizeItemBounds);
      }}
    >
      {visualizeItemBounds ? <LuEye /> : <LuEyeClosed />}
    </IconButton>
  ) : undefined;

  return (
    <>
      {nextPrevButtons}
      {itemBoundsButton}
    </>
  );
}
