import {
  Badge,
  Box,
  Button,
  ButtonGroup,
  HStack,
  Input,
  Menu,
  Portal,
  Span,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import useStacMap from "../hooks/stac-map";
import { ColorModeButton } from "./ui/color-mode";
import Upload from "./upload";

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

export default function Header() {
  return (
    <HStack pointerEvents={"auto"}>
      <HrefInput></HrefInput>
      <ButtonGroup variant={"subtle"}>
        <Upload></Upload>
        <Examples></Examples>
        <ColorModeButton></ColorModeButton>
      </ButtonGroup>
    </HStack>
  );
}

function HrefInput() {
  const { href, setHref } = useStacMap();
  const [value, setValue] = useState(href || "");

  useEffect(() => {
    if (href) {
      setValue(href);
    }
  }, [href]);

  return (
    <Box
      as={"form"}
      onSubmit={(e) => {
        e.preventDefault();
        setHref(value);
      }}
      w={"full"}
    >
      <Input
        bg={"bg.muted/90"}
        placeholder="Enter a STAC JSON or GeoParquet url"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      ></Input>
    </Box>
  );
}

function Examples() {
  const { setHref } = useStacMap();

  return (
    <Menu.Root onSelect={(details) => setHref(details.value)}>
      <Menu.Trigger asChild>
        <Button>Examples</Button>
      </Menu.Trigger>
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
