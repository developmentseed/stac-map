import {
  Alert,
  Box,
  Center,
  IconButton,
  Link,
  SkeletonText,
  Stack,
  Text,
} from "@chakra-ui/react";
import { LuGithub } from "react-icons/lu";
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
    default:
      return (
        // @ts-expect-error Fallback for unknown types
        <Alert.Root status="error">Unknown STAC type: {value.type}</Alert.Root>
      );
  }
}

function Introduction() {
  return (
    <Stack>
      <Text fontSize={"sm"} fontWeight={"lighter"}>
        stac-map is a map-first, statically-served, single-page visualization
        tool for{" "}
        <Link variant={"underline"} href="https://stacspec.org">
          STAC
        </Link>{" "}
        catalogs, collections, and items.
      </Text>
      <Center>
        <IconButton variant={"ghost"} size={"sm"} asChild>
          <a href="https://github.com/developmentseed/stac-map" target="_blank">
            <LuGithub></LuGithub>
          </a>
        </IconButton>
      </Center>
    </Stack>
  );
}
