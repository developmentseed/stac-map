import {
  Alert,
  Box,
  FileUpload,
  Link,
  SkeletonText,
  Stack,
} from "@chakra-ui/react";
import { Examples } from "../examples";
import useStacMap from "../hooks/stac-map";
import type { StacValue } from "../types/stac";
import { Catalog } from "./catalog";
import { Collection } from "./collection";
import Item from "./item";
import ItemCollection from "./item-collection";
import { NavigationBreadcrumbs } from "./navigation-breadcrumbs";

export default function Panel() {
  const { href, value, picked } = useStacMap();

  let content;

  if (!href) {
    content = <Introduction></Introduction>;
  } else if (!value) {
    content = <SkeletonText noOfLines={3} />;
  } else if (picked) {
    content = <ValueContent value={picked}></ValueContent>;
  } else {
    content = <ValueContent value={value}></ValueContent>;
  }

  return (
    <Box bg={"bg.muted"} rounded={4} pointerEvents={"auto"} overflow={"hidden"}>
      <Box px={4} py={3} borderBottomWidth={1} borderColor={"border.subtle"}>
        <NavigationBreadcrumbs></NavigationBreadcrumbs>
      </Box>
      <Box overflow={"scroll"} maxH={{ base: "40dvh", md: "80dvh" }} p={4}>
        {content}
      </Box>
    </Box>
  );
}

function ValueContent({ value }: { value: StacValue }) {
  switch (value.type) {
    case "Catalog":
      return <Catalog catalog={value}></Catalog>;
    case "Collection":
      return <Collection collection={value}></Collection>;
    case "Feature":
      return <Item item={value}></Item>;
    case "FeatureCollection":
      return <ItemCollection itemCollection={value}></ItemCollection>;
    case undefined:
      return (
        <Alert.Root status="error">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Value does not have a "type" field</Alert.Title>
          </Alert.Content>
        </Alert.Root>
      );
    default:
      return (
        <Alert.Root status="error">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Unknown "type" field</Alert.Title>
            <Alert.Description>
              {
                // @ts-expect-error Fallback for unknown types
                value.type
              }{" "}
              is not a valid STAC type
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      );
  }
}

function Introduction() {
  const { fileUpload } = useStacMap();

  return (
    <Stack fontSize={"sm"} fontWeight={"lighter"}>
      <Box>
        <strong>stac-map</strong> is a map-first, statically-served, single-page
        visualization tool for{" "}
        <Link variant={"underline"} href="https://stacspec.org">
          STAC
        </Link>{" "}
        catalogs, collections, and items. To get started, use the text input,{" "}
        <FileUpload.RootProvider
          value={fileUpload}
          as={"span"}
          display={"inline"}
        >
          <FileUpload.Trigger asChild>
            <Link>upload a file</Link>
          </FileUpload.Trigger>
        </FileUpload.RootProvider>
        , or load an{" "}
        <Examples>
          <Link>example</Link>
        </Examples>
        .
      </Box>
      <Box>
        Questions, issues, or feature requests? Get in touch on{" "}
        <Link asChild>
          <a href="https://github.com/developmentseed/stac-map" target="_blank">
            GitHub
          </a>
        </Link>
        .
      </Box>
    </Stack>
  );
}
