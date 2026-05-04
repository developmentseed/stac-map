import { useStore } from "@/store";
import { Center, Checkbox } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { LuEye } from "react-icons/lu";
import type { StacLink } from "stac-ts";
import Section from "./ui/section";

export default function Tilejson({ link }: { link: StacLink }) {
  const [enabled, setEnabled] = useState(true);
  const setMaplibreLayer = useStore((store) => store.setMaplibreLayer);

  useEffect(() => {
    if (!enabled) return;

    setMaplibreLayer("tilejson", {
      source: {
        id: "tilejson",
        type: "raster",
        url: link.href,
      },
      layer: {
        id: "tilejson",
        type: "raster",
      },
    });

    return () => {
      setMaplibreLayer("tilejson", undefined);
    };
  }, [link, setMaplibreLayer, enabled]);

  return (
    <Section icon={<LuEye />} title="Tilejson">
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
    </Section>
  );
}
