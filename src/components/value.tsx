import {
  Box,
  Button,
  ButtonGroup,
  HStack,
  Icon,
  Image,
  SkeletonText,
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
import type { StacValue } from "../types/stac";
import { Catalogs } from "./catalog";
import { Collection, Collections } from "./collection";
import Item from "./item";
import ItemCollection from "./item-collection";
import { Prose } from "./ui/prose";

export default function Value({ value }: { value: StacValue }) {
  let detail;
  switch (value.type) {
    case "Catalog":
      detail = <></>;
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
  const { catalogs, collections, isFetchingCollections } = useStacMap();
  const thumbnailAsset =
    value.assets &&
    typeof value.assets === "object" &&
    "thumbnail" in value.assets
      ? (value.assets.thumbnail as StacAsset)
      : undefined;
  const selfHref = value.links?.find((link) => link.rel == "self")?.href;
  const ValueIcon = getValueIcon(value);
  const type = getValueType(value);

  return (
    <Stack gap={4}>
      <Stack>
        <HStack fontSize={"xs"} fontWeight={"light"}>
          <Icon>
            <ValueIcon></ValueIcon>
          </Icon>
          {type}
        </HStack>

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
      </Stack>

      <Box>{children}</Box>

      {catalogs && catalogs.length > 0 && (
        <Catalogs catalogs={catalogs}></Catalogs>
      )}
      {(collections && collections.length > 0 && (
        <Collections collections={collections}></Collections>
      )) ||
        (isFetchingCollections && <SkeletonText noOfLines={3}></SkeletonText>)}
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
