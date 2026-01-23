import { useEffect } from "react";
import { LuExternalLink, LuFileJson, LuFiles } from "react-icons/lu";
import {
  Badge,
  Button,
  ButtonGroup,
  CloseButton,
  CodeBlock,
  createShikiAdapter,
  Dialog,
  Heading,
  HStack,
  IconButton,
  Portal,
  Stack,
} from "@chakra-ui/react";
import type { StacAsset } from "stac-ts";
import type { HighlighterGeneric } from "shiki";
import Assets from "./assets";
import Breadcrumbs from "./breadcrumbs";
import Catalogs from "./catalogs";
import Children from "./children";
import CollectionSearch from "./collection-search";
import Collections from "./collections";
import CollectionsHref from "./collections-href";
import Description from "./description";
import ItemLinks from "./item-links";
import Items from "./items";
import RootHref from "./root-href";
import { Section } from "./section";
import StacGeoparquetHref from "./stac-geoparquet-href";
import Thumbnail from "./thumbnail";
import { useStore } from "../store";
import type { StacValue } from "../types/stac";
import { conformsToFreeTextCollectionSearch } from "../utils/stac";
import {
  getLinkHref,
  getStacValueTitle,
  getThumbnailAsset,
} from "../utils/stac";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const shikiAdapter = createShikiAdapter<HighlighterGeneric<any, any>>({
  async load() {
    const { createHighlighter } = await import("shiki");
    return createHighlighter({
      langs: ["json"],
      themes: ["github-dark", "github-light"],
    });
  },
  theme: {
    light: "github-light",
    dark: "github-dark",
  },
});

export default function Value({ value }: { value: StacValue }) {
  const catalogs = useStore((store) => store.catalogs);
  const collections = useStore((store) => store.collections);
  const items = useStore((store) => store.searchItems || store.items);
  const href = useStore((store) => store.href);
  const hrefIsParquet = useStore((store) => store.hrefIsParquet);
  const connection = useStore((store) => store.connection);

  const collectionsHref = getLinkHref(value, "data");
  const childrenLinks = value.links?.filter((link) => link.rel === "child");
  const itemLinks = value.links?.filter((link) => link.rel === "item");
  const selfHref = getLinkHref(value, "self");
  const rootHref = getLinkHref(value, "root");
  const version = value.stac_version as string | undefined;
  const thumbnailAsset = getThumbnailAsset(value);

  useEffect(() => {
    document.title = "stac-map | " + getStacValueTitle(value);
  }, [value]);

  return (
    <>
      <Stack gap={4}>
        <Heading wordBreak={"break-all"}>
          <HStack gap={4}>
            {getStacValueTitle(value)}
            {version && <Badge variant={"surface"}>{version}</Badge>}
          </HStack>
        </Heading>

        <Breadcrumbs value={value} />

        <HStack>
          <ButtonGroup variant={"surface"} size="xs">
            {selfHref && (
              <Button asChild>
                <a
                  href={
                    (import.meta.env.VITE_STAC_BROWSER_URL ||
                      "https://radiantearth.github.io/stac-browser/#/external/") +
                    selfHref.replace(/^(https?:\/\/)/, "")
                  }
                  target="_blank"
                >
                  <LuExternalLink />
                  STAC Browser
                </a>
              </Button>
            )}
            <JsonButton value={value} />
          </ButtonGroup>
        </HStack>

        {thumbnailAsset && <Thumbnail asset={thumbnailAsset} />}

        {"description" in value && (
          <Description description={value.description as string} />
        )}

        {rootHref && <RootHref href={rootHref} value={value} />}

        {conformsToFreeTextCollectionSearch(value) && <CollectionSearch />}

        {collectionsHref && <CollectionsHref href={collectionsHref} />}

        {collections && <Collections collections={collections} />}

        {catalogs && <Catalogs catalogs={catalogs} />}

        {!collectionsHref && childrenLinks && childrenLinks.length > 0 && (
          <Children links={childrenLinks} />
        )}

        {itemLinks && <ItemLinks links={itemLinks} />}

        {items && value.type === "Collection" && (
          <Section
            icon={<LuFiles />}
            title="Items"
            count={items.length}
            defaultListOrCard="list"
          >
            {(listOrCard) => <Items items={items} listOrCard={listOrCard} />}
          </Section>
        )}

        {href && hrefIsParquet && connection && (
          <StacGeoparquetHref href={href} connection={connection} />
        )}

        {(value.assets as { [k: string]: StacAsset }) && (
          <Assets assets={value.assets as { [k: string]: StacAsset }} />
        )}
      </Stack>
    </>
  );
}

function JsonButton({ value }: { value: StacValue }) {
  return (
    <Dialog.Root size={"xl"}>
      <Dialog.Trigger asChild>
        <Button>
          <LuFileJson />
          JSON
        </Button>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>JSON</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <CodeBlock.AdapterProvider value={shikiAdapter}>
                <CodeBlock.Root
                  code={JSON.stringify(value, null, 2)}
                  language="json"
                  size={"sm"}
                >
                  <CodeBlock.Header>
                    <CodeBlock.Title>{value.id}.json</CodeBlock.Title>
                    <CodeBlock.CopyTrigger asChild>
                      <IconButton variant="ghost" size="2xs">
                        <CodeBlock.CopyIndicator />
                      </IconButton>
                    </CodeBlock.CopyTrigger>
                  </CodeBlock.Header>
                  <CodeBlock.Content>
                    <CodeBlock.Code>
                      <CodeBlock.CodeText />
                    </CodeBlock.Code>
                  </CodeBlock.Content>
                </CodeBlock.Root>
              </CodeBlock.AdapterProvider>
            </Dialog.Body>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
