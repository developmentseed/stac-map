import {
  Box,
  Breadcrumb,
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
    typeof value.assets === "object" &&
    value.assets &&
    "thumbnail" in value.assets &&
    (value.assets.thumbnail as StacAsset);
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

        <Breadcrumbs value={value}></Breadcrumbs>

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

function Breadcrumbs({ value }: { value: StacValue }) {
  const { href, setHref } = useStacMap();
  const selfHref = value.links?.find((link) => link.rel == "self")?.href;
  const parentHref = value.links?.find((link) => link.rel == "parent")?.href;
  const rootHref = value.links?.find((link) => link.rel == "root")?.href;
  let rootUrl;
  let parentUrl;
  if (rootHref) {
    try {
      rootUrl = new URL(rootHref, selfHref);
    } catch {
      // pass
    }
    if (rootUrl?.toString() == selfHref) {
      rootUrl = undefined;
    }
  }
  if (parentHref) {
    try {
      parentUrl = new URL(parentHref, selfHref);
    } catch {
      // pass
    }
    if (
      parentUrl?.toString() == href ||
      parentUrl?.toString() == rootUrl?.toString()
    ) {
      parentUrl = undefined;
    }
  }
  return (
    <Breadcrumb.Root>
      <Breadcrumb.List>
        {rootUrl && (
          <>
            <Breadcrumb.Item>
              <Breadcrumb.Link
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setHref(rootUrl.toString());
                }}
                whiteSpace={"nowrap"}
              >
                Root
              </Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Separator></Breadcrumb.Separator>
          </>
        )}
        {parentUrl && (
          <>
            <Breadcrumb.Item>
              <Breadcrumb.Link
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setHref(parentUrl.toString());
                }}
                whiteSpace={"nowrap"}
              >
                Parent
              </Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Separator></Breadcrumb.Separator>
          </>
        )}
        <Breadcrumb.Item>
          <Breadcrumb.CurrentLink>
            {(value.title as string) ?? value.id ?? ""}
          </Breadcrumb.CurrentLink>
        </Breadcrumb.Item>
      </Breadcrumb.List>
    </Breadcrumb.Root>
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
