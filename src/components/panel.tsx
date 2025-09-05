import {
  Accordion,
  Box,
  Center,
  HStack,
  Icon,
  IconButton,
  Link,
  SkeletonText,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { LuChevronDown, LuFilter, LuGithub } from "react-icons/lu";
import useStacMap from "../hooks/stac-map";
import useStacValue from "../hooks/stac-value";
import Filter from "./filter";
import { NavigationBreadcrumbs } from "./navigation-breadcrumbs";
import ItemSearch from "./search/item";
import Value from "./value";

export default function Panel() {
  const { href, value, picked, temporalExtents, setHref } = useStacMap();
  const [view, setView] = useState<
    "intro" | "catalog" | "collection" | "item" | "picked"
  >("intro");

  const selfHref = value?.links?.find((link) => link.rel == "self")?.href;
  const rootHref = value?.links?.find((link) => link.rel == "root")?.href;
  const parentHref = value?.links?.find((link) => link.rel == "parent")?.href;
  const collectionHref =
    value?.type == "Feature"
      ? value?.links?.find((link) => link.rel == "collection")?.href
      : undefined;

  const { value: root } = useStacValue(rootHref);
  const { value: parent } = useStacValue(parentHref);
  const { value: collection } = useStacValue(collectionHref);

  const searchLinks =
    root?.links?.filter((link) => link.rel == "search") ||
    value?.links?.filter((link) => link.rel == "search");

  useEffect(() => {
    if (!href && !value) {
      setView("intro");
    } else if (picked) {
      setView("picked");
    } else if (value) {
      switch (value.type) {
        case "Catalog":
          setView("catalog");
          break;
        case "Collection":
          setView("collection");
          break;
        case "Feature":
          setView("item");
          break;
        case "FeatureCollection":
          setView("collection");
          break;
      }
    }
  }, [href, value, picked]);

  return (
    <Box bg={"bg.muted"} rounded={4} pointerEvents={"auto"} overflow={"hidden"}>
      {value && (
        <Box
          px={4}
          pt={3}
          pb={2}
          borderBottomWidth={1}
          borderColor={"border.subtle"}
        >
          <NavigationBreadcrumbs
            value={value}
            view={view}
            setHref={setHref}
            picked={picked}
            root={root}
            parent={parent}
            collection={collection}
            selfHref={selfHref}
            rootHref={rootHref}
            parentHref={parentHref}
            collectionHref={collectionHref}
          />
        </Box>
      )}

      <Box
        overflow={"scroll"}
        maxH={{ base: "40dvh", md: "80dvh" }}
        px={4}
        pb={4}
        pt={value ? 3 : 4}
      >
        {view === "intro" && <Introduction />}

        {view === "catalog" && value && <Value value={value} />}

        {view === "collection" && value && (
          <Stack gap={4}>
            <Value value={value} />

            {searchLinks && value.type === "Collection" && (
              <Stack gap={3}>
                <Box>
                  <Text fontSize="sm" fontWeight="semibold" mb={2}>
                    Item Search
                  </Text>
                  <ItemSearch collection={value} links={searchLinks} />
                </Box>

                {temporalExtents && (
                  <Accordion.Root variant="subtle" collapsible>
                    <Accordion.Item value="filter">
                      <Accordion.ItemTrigger>
                        <HStack gap={2}>
                          <Icon>
                            <LuFilter />
                          </Icon>
                          <Text fontSize="sm" fontWeight="semibold">
                            Temporal Filter
                          </Text>
                        </HStack>
                        <Accordion.ItemIndicator>
                          <LuChevronDown />
                        </Accordion.ItemIndicator>
                      </Accordion.ItemTrigger>
                      <Accordion.ItemContent>
                        <Box pt={2}>
                          <Filter temporalExtents={temporalExtents} />
                        </Box>
                      </Accordion.ItemContent>
                    </Accordion.Item>
                  </Accordion.Root>
                )}
              </Stack>
            )}
          </Stack>
        )}

        {view === "item" && value && <Value value={value} />}
        {view === "picked" && picked && <Value value={picked} />}

        {href && !value && <SkeletonText noOfLines={3} />}
      </Box>
    </Box>
  );
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
