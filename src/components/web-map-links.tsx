import { useStore } from "@/store";
import {
  Center,
  Checkbox,
  createListCollection,
  Field,
  Portal,
  Select,
  Stack,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { LuEye } from "react-icons/lu";
import type { StacLink } from "stac-ts";
import Section from "./ui/section";

type LayerType = "tilejson";

export default function WebMapLinks({
  tilejsonLink,
}: {
  tilejsonLink: StacLink | undefined;
}) {
  const [layerType, setLayerType] = useState<LayerType>("tilejson");
  const [enabled, setEnabled] = useState(true);
  const setMaplibreLayer = useStore((store) => store.setMaplibreLayer);

  const collection = useMemo(
    () =>
      createListCollection({
        items: [{ label: "TileJSON", value: "tilejson" }],
      }),
    []
  );

  useEffect(() => {
    if (!enabled) return;

    if (layerType === "tilejson" && tilejsonLink)
      setMaplibreLayer("web-map", {
        source: {
          id: "web-map",
          type: "raster",
          url: tilejsonLink.href,
        },
        layer: {
          id: "web-map",
          type: "raster",
        },
      });

    return () => {
      setMaplibreLayer("web-map", undefined);
    };
  }, [tilejsonLink, setMaplibreLayer, layerType, enabled]);

  return (
    <Section icon={<LuEye />} title="Web map">
      <Stack gap={4}>
        <Field.Root>
          <Field.Label>Layer type</Field.Label>
          <Select.Root
            size={"sm"}
            collection={collection}
            value={[layerType]}
            onValueChange={(e) => setLayerType(e.value[0] as LayerType)}
            disabled={!enabled}
          >
            <Select.HiddenSelect />
            <Select.Control>
              <Select.Trigger>
                <Select.ValueText />
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
        </Field.Root>
        <Center>
          <Checkbox.Root
            checked={enabled}
            onCheckedChange={(e) => setEnabled(!!e.checked)}
          >
            <Checkbox.HiddenInput />
            <Checkbox.Control />
            <Checkbox.Label>Enabled</Checkbox.Label>
          </Checkbox.Root>
        </Center>
      </Stack>
    </Section>
  );
}
