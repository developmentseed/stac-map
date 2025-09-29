import { useState } from "react";
import {
  LuArrowLeft,
  LuArrowRight,
  LuExternalLink,
  LuFile,
  LuFileQuestion,
  LuFiles,
  LuFolder,
  LuFolderPlus,
} from "react-icons/lu";
import { MarkdownHooks } from "react-markdown";
import {
  Button,
  ButtonGroup,
  Heading,
  HStack,
  Icon,
  Image,
  Span,
  Stack,
} from "@chakra-ui/react";
import type { StacAsset, StacLink } from "stac-ts";
import { Prose } from "./ui/prose";
import type { StacValue } from "../types/stac";

export default function Value({
  value,
  thumbnailAsset,
  href,
  setHref,
  nextLink,
  prevLink,
}: {
  value: StacValue;
  thumbnailAsset: StacAsset | undefined;
  href: string;
  setHref: (href: string | undefined) => void;
  nextLink: StacLink | undefined;
  prevLink: StacLink | undefined;
}) {
  const [thumbnailError, setThumbnailError] = useState(false);
  const selfHref = value.links?.find((link) => link.rel === "self")?.href;

  return (
    <Stack gap={4}>
      <Heading>
        <HStack>
          <Icon>{getValueIcon(value)}</Icon>
          {(value.title as string) ||
            value.id ||
            href.split("/").at(-1)?.split("?").at(0)}
        </HStack>
      </Heading>

      {thumbnailAsset && !thumbnailError && (
        <Image
          src={thumbnailAsset.href}
          onError={() => setThumbnailError(true)}
        />
      )}

      {!!value.description && (
        <Prose>
          <MarkdownHooks>{value.description as string}</MarkdownHooks>
        </Prose>
      )}

      {selfHref && (
        <ButtonGroup variant={"surface"} size={"sm"}>
          <Button asChild>
            <a href={selfHref} target="_blank">
              <LuExternalLink /> Source
            </a>
          </Button>
          <Button asChild>
            <a
              href={
                // TODO make this configurable
                "https://radiantearth.github.io/stac-browser/#/external/" +
                href.replace(/^(https?:\/\/)/, "")
              }
              target="_blank"
            >
              <LuExternalLink /> STAC Browser
            </a>
          </Button>
          {value.type === "Feature" && (
            <Button asChild>
              <a
                href={"https://titiler.xyz/stac/viewer?url=" + selfHref}
                target="_blank"
              >
                <LuExternalLink></LuExternalLink> TiTiler
              </a>
            </Button>
          )}
        </ButtonGroup>
      )}

      {(prevLink || nextLink) && (
        <ButtonGroup variant={"surface"} size={"sm"}>
          {prevLink && (
            <Button onClick={() => setHref(prevLink.href)}>
              <LuArrowLeft />
              Prev
            </Button>
          )}
          <Span flex={"1"} />
          {nextLink && (
            <Button onClick={() => setHref(nextLink.href)}>
              Next
              <LuArrowRight />
            </Button>
          )}
        </ButtonGroup>
      )}
    </Stack>
  );
}

function getValueIcon(value: StacValue) {
  switch (value.type) {
    case "Catalog":
      return <LuFolder />;
    case "Collection":
      return <LuFolderPlus />;
    case "Feature":
      return <LuFile />;
    case "FeatureCollection":
      return <LuFiles />;
    default:
      return <LuFileQuestion />;
  }
}
