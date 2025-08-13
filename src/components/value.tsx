import {
  Button,
  ButtonGroup,
  DataList,
  Heading,
  HStack,
  Icon,
  Image,
  Link,
  Stack,
} from "@chakra-ui/react";
import type { ReactNode } from "react";
import {
  LuExternalLink,
  LuFile,
  LuFiles,
  LuFolder,
  LuFolderPlus,
} from "react-icons/lu";
import { MarkdownHooks } from "react-markdown";
import type { StacAsset } from "stac-ts";
import useStacMap from "../hooks/stac-map";
import useStacValue from "../hooks/stac-value";
import type { StacValue } from "../types/stac";
import Catalog from "./catalog";
import Collection from "./collection";
import Item from "./item";
import ItemCollection from "./item-collection";
import { Prose } from "./ui/prose";

export default function Value({ value }: { value: StacValue }) {
  let detail;
  switch (value.type) {
    case "Catalog":
      detail = <Catalog></Catalog>;
      break;
    case "Collection":
      detail = <Collection collection={value}></Collection>;
      break;
    case "Feature":
      detail = <Item item={value}></Item>;
      break;
    case "FeatureCollection":
      detail = <ItemCollection></ItemCollection>;
      break;
  }
  return <Overview value={value}>{detail}</Overview>;
}

function Overview({
  value,
  children,
}: {
  value: StacValue;
  children: ReactNode;
}) {
  const { setHref } = useStacMap();
  const thumbnailAsset =
    typeof value.assets === "object" &&
    value.assets &&
    "thumbnail" in value.assets &&
    (value.assets.thumbnail as StacAsset);
  const selfHref = value.links?.find((link) => link.rel == "self")?.href;
  const rootHref = value.links?.find((link) => link.rel == "root")?.href;
  const parentHref = value.links?.find((link) => link.rel == "parent")?.href;
  const { value: root } = useStacValue(rootHref);
  const { value: parent } = useStacValue(parentHref);
  const ValueIcon = getValueIcon(value);
  const type = getValueType(value);

  return (
    <Stack>
      <HStack fontSize={"xs"} fontWeight={"light"}>
        <Icon>
          <ValueIcon></ValueIcon>
        </Icon>
        {type}
      </HStack>
      <Stack gap={4}>
        <Heading fontSize={(value.title && "larger") || "small"}>
          {(value.title as string) ?? value.id ?? ""}
        </Heading>
        {((root && rootHref != selfHref) ||
          (parent && parentHref != rootHref)) && (
          <DataList.Root orientation={"horizontal"} size={"sm"}>
            {root && rootHref != selfHref && (
              <DataList.Item>
                <DataList.ItemLabel>Root</DataList.ItemLabel>
                <DataList.ItemValue>
                  <Link onClick={() => setHref(rootHref)}>
                    {(root.title as string | undefined) || root.id || ""}
                  </Link>
                </DataList.ItemValue>
              </DataList.Item>
            )}
            {parent && parentHref != rootHref && (
              <DataList.Item>
                <DataList.ItemLabel>Parent</DataList.ItemLabel>
                <DataList.ItemValue>
                  <Link onClick={() => setHref(parentHref)}>
                    {(parent.title as string | undefined) || parent.id || ""}
                  </Link>
                </DataList.ItemValue>
              </DataList.Item>
            )}
          </DataList.Root>
        )}
        {thumbnailAsset && (
          <Image
            maxH={"200px"}
            fit={"scale-down"}
            src={thumbnailAsset.href}
          ></Image>
        )}
        {!!value.description && (
          <Prose>
            <MarkdownHooks>{value.description as string}</MarkdownHooks>
          </Prose>
        )}
      </Stack>
      {children}
      <ButtonGroup size={"xs"} variant={"outline"}>
        {selfHref && (
          <>
            <Button asChild>
              <a href={selfHref} target="_blank">
                <LuExternalLink></LuExternalLink> Source
              </a>
            </Button>
            <Button asChild>
              <a
                href={
                  "https://radiantearth.github.io/stac-browser/#/external/" +
                  selfHref.replace(/^(https?:\/\/)/, "")
                }
                target="_blank"
              >
                <LuExternalLink></LuExternalLink> STAC Browser
              </a>
            </Button>
          </>
        )}
      </ButtonGroup>

      {children}
    </Stack>
  );
}

function getValueIcon(value: StacValue) {
  switch (value.type) {
    case "Catalog":
      return LuFolder;
    case "Collection":
      return LuFolderPlus;
    case "Feature":
      return LuFile;
    case "FeatureCollection":
      return LuFiles;
  }
}

function getValueType(value: StacValue) {
  switch (value.type) {
    case "Catalog":
      return "Catalog";
    case "Collection":
      return "Collection";
    case "Feature":
      return "Item";
    case "FeatureCollection":
      return "ItemCollection";
  }
}
