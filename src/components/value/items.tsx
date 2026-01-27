import { useStore } from "@/store";
import { fitBounds } from "@/utils/map";
import {
  Button,
  ButtonGroup,
  Center,
  DownloadTrigger,
  List,
  Stack,
} from "@chakra-ui/react";
import {
  LuDownload,
  LuEye,
  LuEyeClosed,
  LuFiles,
  LuFocus,
} from "react-icons/lu";
import { useMap } from "react-map-gl/maplibre";
import type { StacItem } from "stac-ts";
import * as stac_wasm from "stac-wasm";
import ItemCard from "../cards/item";
import ItemListItem from "../list-items/item";
import { Section } from "../section";

export default function Items({ items }: { items: StacItem[] }) {
  const visualizeItems = useStore((store) => store.visualizeItems);
  const setVisualizeItems = useStore((store) => store.setVisualizeItems);
  const title = `Items (${items.length})`;
  const { map } = useMap();

  return (
    <Section defaultListOrCard="list" title={title} icon={<LuFiles />}>
      {(listOrCard) => {
        return (
          <Stack>
            <Center>
              <ButtonGroup size="2xs" variant={"subtle"} attached>
                <Button onClick={() => setVisualizeItems(!visualizeItems)}>
                  {visualizeItems ? <LuEye /> : <LuEyeClosed />}
                  {visualizeItems ? "Hide" : "Show"}
                </Button>
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
