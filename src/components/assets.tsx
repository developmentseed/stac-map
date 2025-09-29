import { useState } from "react";
import { LuDownload } from "react-icons/lu";
import {
  Button,
  ButtonGroup,
  Card,
  Collapsible,
  DataList,
  HStack,
  Image,
} from "@chakra-ui/react";
import type { StacAsset } from "stac-ts";
import Properties from "./properties";
import type { StacAssets } from "../types/stac";

export default function Assets({ assets }: { assets: StacAssets }) {
  return (
    <DataList.Root>
      {Object.keys(assets).map((key) => (
        <DataList.Item key={"asset-" + key}>
          <DataList.ItemLabel>{key}</DataList.ItemLabel>
          <DataList.ItemValue>
            <Asset asset={assets[key]} />
          </DataList.ItemValue>
        </DataList.Item>
      ))}
    </DataList.Root>
  );
}

function Asset({ asset }: { asset: StacAsset }) {
  const [imageError, setImageError] = useState(false);
  // eslint-disable-next-line
  const { href, roles, type, title, ...properties } = asset;

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
        <HStack justify={"right"}>
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
