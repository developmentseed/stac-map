import { MarkdownHooks } from "react-markdown";
import { Card } from "@chakra-ui/react";
import Thumbnail from "./thumbnail";
import { Prose } from "./ui/prose";
import { useStore } from "../store";
import type { StacValue } from "../types/stac";
import { getSelfHref, getStacValueTitle, getThumbnailAsset } from "../utils/stac";

interface ValueCardProps {
  value: StacValue;
  hovered?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export default function ValueCard({
  value,
  hovered,
  onMouseEnter,
  onMouseLeave,
}: ValueCardProps) {
  const href = getSelfHref(value);
  const setHref = useStore((store) => store.setHref);
  const thumbnailAsset = getThumbnailAsset(value);
  const description = "description" in value ? value.description : undefined;

  return (
    <Card.Root
      borderWidth={hovered !== undefined ? 2 : undefined}
      borderColor={hovered ? "colorPalette.solid" : "transparent"}
      cursor={"pointer"}
      onClick={() => href && setHref(href)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Card.Header>
        <Card.Title>{getStacValueTitle(value)}</Card.Title>
      </Card.Header>
      {(thumbnailAsset || description) && (
        <Card.Body>
          <Card.Description as="div">
            {thumbnailAsset && <Thumbnail asset={thumbnailAsset} />}
            {description && (
              <Prose lineClamp={5}>
                <MarkdownHooks>{description}</MarkdownHooks>
              </Prose>
            )}
          </Card.Description>
        </Card.Body>
      )}
    </Card.Root>
  );
}
