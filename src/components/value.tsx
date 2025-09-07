import { Button, ButtonGroup, Heading, Image, Stack } from "@chakra-ui/react";
import { type ReactNode } from "react";
import { LuExternalLink } from "react-icons/lu";
import { MarkdownHooks } from "react-markdown";
import type { StacAsset } from "stac-ts";
import type { StacValue } from "../types/stac";
import { Prose } from "./ui/prose";

export default function Value({
  value,
  children,
}: {
  value: StacValue;
  children?: ReactNode;
}) {
  const thumbnailAsset =
    value.assets &&
    typeof value.assets === "object" &&
    "thumbnail" in value.assets
      ? (value.assets.thumbnail as StacAsset)
      : undefined;
  const selfHref = value.links?.find((link) => link.rel == "self")?.href;

  return (
    <Stack>
      <Heading>{(value.title as string) || value.id || value.type}</Heading>

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

      {children}

      <ButtonGroup size={"xs"} variant={"outline"} py={4}>
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
  );
}
