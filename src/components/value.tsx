import {
  LuArrowUp,
  LuArrowUpLeft,
  LuExternalLink,
  LuFileJson,
} from "react-icons/lu";
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
import Children from "./children";
import Collections from "./collections";
import Description from "./description";
import Root from "./root";
import SearchItems from "./search-items";
import Thumbnail from "./thumbnail";
import { useStore } from "../store";
import type { StacValue } from "../types/stac";
import {
  getLinkHref,
  getStacValueTitle,
  getStacValueType,
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
  const searchItems = useStore((store) => store.searchItems);
  const setHref = useStore((store) => store.setHref);

  const collectionsHref = getLinkHref(value, "data");
  const childrenLinks = value.links?.filter((link) => link.rel === "child");
  const selfHref = getLinkHref(value, "self");
  const rootHref = getLinkHref(value, "root");
  const parentHref = getLinkHref(value, "parent");
  const version = value.stac_version as string | undefined;
  const thumbnailAsset = getThumbnailAsset(value);

  return (
    <>
      <Stack gap={6}>
        <Heading>{getStacValueTitle(value)}</Heading>

        <HStack>
          {value.id && (
            <Badge variant={"surface"}>{getStacValueType(value)}</Badge>
          )}
          {version && <Badge variant={"surface"}>{version}</Badge>}
        </HStack>

        <HStack>
          <ButtonGroup variant={"outline"} size="xs">
            {rootHref && rootHref !== selfHref && (
              <Button onClick={() => setHref(rootHref)}>
                <LuArrowUpLeft />
                Root
              </Button>
            )}
            {parentHref && parentHref !== rootHref && (
              <Button onClick={() => setHref(parentHref)}>
                <LuArrowUp />
                Parent
              </Button>
            )}
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

        {rootHref && <Root rootHref={rootHref} value={value} />}

        {(value.assets as { [k: string]: StacAsset }) && (
          <Assets assets={value.assets as { [k: string]: StacAsset }} />
        )}

        {searchItems && <SearchItems items={searchItems} />}

        {collectionsHref && <Collections href={collectionsHref} />}

        {!collectionsHref && childrenLinks && childrenLinks.length > 0 && (
          <Children links={childrenLinks} />
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
