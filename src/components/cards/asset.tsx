import { useState } from "react";
import { LuDownload } from "react-icons/lu";
import {
  Button,
  ButtonGroup,
  Card,
  Checkbox,
  Collapsible,
  DataList,
  HStack,
  Image,
  Span,
} from "@chakra-ui/react";
import type { StacAsset } from "stac-ts";
import { isGeoTiff } from "../../utils/stac";
import Properties from "../sections/properties";

export default function AssetCard({
  asset,
  cogHref,
  setcogHref,
}: {
  asset: StacAsset;
  cogHref: string | undefined;
  setcogHref: (href: string | undefined) => void;
}) {
  const [imageError, setImageError] = useState(false);
  // eslint-disable-next-line
  const { href, roles, type, title, ...properties } = asset;

  const checked = cogHref === asset.href;

  return (
    <Card.Root size={"sm"} w="full">
      <Card.Header>
        {asset.title && <Card.Title>{asset.title}</Card.Title>}
      </Card.Header>
      <Card.Body gap={6}>
        {!imageError && (
          <Image src={asset.href} onError={() => setImageError(true)} />
        )}
        <DataList.Root orientation={"horizontal"}>
          {asset.roles && (
            <DataList.Item>
              <DataList.ItemLabel>Roles</DataList.ItemLabel>
              <DataList.ItemValue>{asset.roles?.join(", ")}</DataList.ItemValue>
            </DataList.Item>
          )}
          {asset.type && (
            <DataList.Item>
              <DataList.ItemLabel>Type</DataList.ItemLabel>
              <DataList.ItemValue>{asset.type}</DataList.ItemValue>
            </DataList.Item>
          )}
        </DataList.Root>
        {Object.keys(properties).length > 0 && (
          <Collapsible.Root>
            <Collapsible.Trigger>Properties</Collapsible.Trigger>
            <Collapsible.Content>
              <Properties properties={properties} />
            </Collapsible.Content>
          </Collapsible.Root>
        )}
        <HStack>
          {isGeoTiff(asset) && (
            <Checkbox.Root
              checked={checked}
              onCheckedChange={(e) => {
                if (e.checked) setcogHref(asset.href);
                else setcogHref(undefined);
              }}
            >
              <Checkbox.HiddenInput />
              <Checkbox.Control />
              <Checkbox.Label>Visualize</Checkbox.Label>
            </Checkbox.Root>
          )}
          <Span flex={"1"} />
          <ButtonGroup size="sm" variant="outline">
            <Button asChild>
              <a href={asset.href} target="_blank">
                <LuDownload /> Download
              </a>
            </Button>
          </ButtonGroup>
        </HStack>
      </Card.Body>
    </Card.Root>
  );
}
