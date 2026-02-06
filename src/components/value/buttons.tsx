import { useStore } from "@/store";
import type { StacValue } from "@/types/stac";
import { fitBounds } from "@/utils/map";
import { getSelfHref } from "@/utils/stac";
import {
  Button,
  ButtonGroup,
  CloseButton,
  CodeBlock,
  Dialog,
  IconButton,
  Portal,
  createShikiAdapter,
} from "@chakra-ui/react";
import { useMemo } from "react";
import {
  LuExternalLink,
  LuEye,
  LuEyeClosed,
  LuFileJson,
  LuFocus,
} from "react-icons/lu";
import { useMap } from "react-map-gl/maplibre";
import type { HighlighterGeneric } from "shiki";
import type { StacLink } from "stac-ts";

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

export default function Buttons({ value }: { value: StacValue }) {
  const selfHref = getSelfHref(value);
  const { map } = useMap();
  const webMapLink = useStore((store) => store.webMapLink);
  const setWebMapLink = useStore((store) => store.setWebMapLink);

  const tileJsonLinks = useMemo(
    () =>
      (value.links as StacLink[] | undefined)?.filter(
        (link) => link.rel === "tilejson"
      ) ?? [],
    [value]
  );

  const wmtsLinks = useMemo(
    () =>
      (value.links as StacLink[] | undefined)?.filter(
        (link) => link.rel === "wmts"
      ) ?? [],
    [value]
  );

  return (
    <ButtonGroup variant={"surface"} size="xs" flexWrap="wrap">
      <Button onClick={() => map && fitBounds(map, value, null)}>
        <LuFocus />
        Zoom to extents
      </Button>
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
      {tileJsonLinks.map((link) => {
        const active = webMapLink?.href === link.href;
        return (
          <Button
            key={link.href}
            onClick={() =>
              setWebMapLink(active ? null : { href: link.href, rel: link.rel })
            }
          >
            {active ? <LuEye /> : <LuEyeClosed />}
            {link.title || "Tiles"}
          </Button>
        );
      })}
      {wmtsLinks.map((link) => {
        const active =
          webMapLink?.href === link.href && webMapLink?.rel === "wmts";
        return (
          <Button
            key={link.href}
            onClick={() =>
              setWebMapLink(
                active
                  ? null
                  : {
                      href: link.href,
                      rel: link.rel,
                      "wmts:layer": link["wmts:layer"] as string[] | undefined,
                      "wmts:dimensions": link["wmts:dimensions"] as
                        | Record<string, string>
                        | undefined,
                      type: link.type,
                    }
              )
            }
          >
            {active ? <LuEye /> : <LuEyeClosed />}
            {link.title || "WMTS"}
          </Button>
        );
      })}
      <JsonButton value={value} />
    </ButtonGroup>
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
