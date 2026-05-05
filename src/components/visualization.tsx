import { useStore } from "@/store";
import type { StacAssets } from "@/types/stac";
import { getCogHref } from "@/utils/stac";
import {
  Checkbox,
  HStack,
  Portal,
  Select,
  createListCollection,
} from "@chakra-ui/react";
import { COGLayer } from "@developmentseed/deck.gl-geotiff";
import { useEffect, useMemo, useState } from "react";
import { LuEye, LuEyeOff } from "react-icons/lu";
import type { StacAsset, StacLink } from "stac-ts";
import Section from "./ui/section";

export default function Visualization({
  links,
  assets,
}: {
  links: StacLink[];
  assets: StacAssets;
}) {
  const tilejsonLink = links.find((link) => link.rel === "tilejson");
  const wmtsLink = links.find((link) => link.rel === "wmts");
  const cogAssets = useMemo(
    () =>
      Object.entries(assets)
        .map((entry) => ({
          key: entry[0],
          title: entry[1].title,
          value: getCogHref(entry[1]),
          score: getScore(entry),
        }))
        .filter((asset) => !!asset.value)
        .sort((a, b) => b.score - a.score),
    [assets]
  );

  const collection = useMemo(() => {
    const items: { label: string; value: string }[] = cogAssets.map(
      (asset) => ({
        label: asset.title ?? asset.key,
        value: `asset:${asset.key}`,
      })
    );
    if (tilejsonLink) {
      items.push({ label: "tilejson", value: "tilejson" });
    }
    if (wmtsLink) {
      items.push({ label: "wmts", value: "wmts" });
    }
    return createListCollection({ items });
  }, [cogAssets, tilejsonLink, wmtsLink]);

  const [selected, setSelected] = useState<string | undefined>(
    () => collection.items[0]?.value
  );
  const [enabled, setEnabled] = useState(true);

  const setLayer = useStore((store) => store.setLayer);
  const setMaplibreLayer = useStore((store) => store.setMaplibreLayer);

  useEffect(() => {
    if (!enabled || !selected) return;

    if (selected.startsWith("asset:")) {
      const assetKey = selected.slice("asset:".length);
      const cogHref = getCogHref(assets[assetKey]);
      if (!cogHref) return;
      const layerId = "visualization";
      setLayer(
        layerId,
        new COGLayer({
          id: layerId,
          geotiff: cogHref,
        })
      );
      return () => setLayer(layerId, undefined);
    }

    if (selected === "tilejson" && tilejsonLink) {
      setMaplibreLayer("visualization", {
        source: {
          id: "visualization",
          type: "raster",
          url: tilejsonLink.href,
        },
        layer: {
          id: "visualization",
          type: "raster",
        },
      });
      return () => setMaplibreLayer("visualization", undefined);
    }

    if (selected === "wmts" && wmtsLink) {
      setMaplibreLayer("visualization", {
        source: {
          id: "visualization",
          type: "raster",
          url: wmtsLink.href,
          tileSize: 256,
        },
        layer: {
          id: "visualization",
          type: "raster",
        },
      });
      return () => setMaplibreLayer("visualization", undefined);
    }
  }, [
    enabled,
    selected,
    assets,
    tilejsonLink,
    wmtsLink,
    setLayer,
    setMaplibreLayer,
  ]);

  if (collection.items.length === 0) return null;

  return (
    <Section icon={enabled ? <LuEye /> : <LuEyeOff />} title="Visualization">
      <HStack gap={4}>
        <Checkbox.Root
          checked={enabled}
          onCheckedChange={(e) => setEnabled(!!e.checked)}
          size={"sm"}
        >
          <Checkbox.HiddenInput />
          <Checkbox.Control />
        </Checkbox.Root>
        <Select.Root
          size={"sm"}
          collection={collection}
          value={selected ? [selected] : []}
          onValueChange={(e) => setSelected(e.value[0])}
          disabled={!enabled}
        >
          <Select.HiddenSelect />
          <Select.Control>
            <Select.Trigger>
              <Select.ValueText placeholder={"Select a visualization"} />
            </Select.Trigger>
            <Select.IndicatorGroup>
              <Select.Indicator />
            </Select.IndicatorGroup>
          </Select.Control>
          <Portal>
            <Select.Positioner>
              <Select.Content>
                {collection.items.map((item) => (
                  <Select.Item key={item.value} item={item}>
                    <Select.ItemText>{item.label}</Select.ItemText>
                    <Select.ItemIndicator />
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
          </Portal>
        </Select.Root>
      </HStack>
    </Section>
  );
}

function getScore([key, asset]: [string, StacAsset]) {
  return (key === "visual" ? 2 : 0) + (asset.roles?.includes("visual") ? 1 : 0);
}
