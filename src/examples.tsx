import { Badge, Menu, Portal, Span } from "@chakra-ui/react";
import { type ReactNode } from "react";
import useStacMap from "./hooks/stac-map";

const EXAMPLES = [
  { title: "eoAPI DevSeed", badge: "API", href: "https://stac.eoapi.dev/" },
  {
    title: "Microsoft Planetary Computer",
    badge: "API",
    href: "https://planetarycomputer.microsoft.com/api/stac/v1",
  },
  {
    title: "Earth Search by Element 84",
    badge: "API",
    href: "https://earth-search.aws.element84.com/v1",
  },
  {
    title: "NASA VEDA",
    badge: "API",
    href: "https://openveda.cloud/api/stac",
  },
  {
    title: "Maxar Open Data",
    badge: "static",
    href: "https://maxar-opendata.s3.dualstack.us-west-2.amazonaws.com/events/catalog.json",
  },
  {
    title: "Colorado NAIP",
    badge: "stac-geoparquet",
    href: "https://raw.githubusercontent.com/developmentseed/labs-375-stac-geoparquet-backend/refs/heads/main/data/naip.parquet",
  },
  {
    title: "Simple item",
    badge: "item",
    href: "https://raw.githubusercontent.com/radiantearth/stac-spec/refs/heads/master/examples/simple-item.json",
  },
];

export function Examples({ children }: { children: ReactNode }) {
  const { setHref } = useStacMap();

  return (
    <Menu.Root onSelect={(details) => setHref(details.value)}>
      <Menu.Trigger asChild>{children}</Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            {EXAMPLES.map(({ title, badge, href }, index) => (
              <Menu.Item key={"example-" + index} value={href}>
                {title}
                <Span flex={1}></Span>
                <Badge>{badge}</Badge>
              </Menu.Item>
            ))}
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}
