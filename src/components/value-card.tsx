import { MarkdownHooks } from "react-markdown";
import { Card } from "@chakra-ui/react";
import type { StacCollection } from "stac-ts";
import Thumbnail from "./thumbnail";
import { Prose } from "./ui/prose";
import { useStore } from "../store";
import type { StacValue } from "../types/stac";
import {
  getSelfHref,
  getStacValueTitle,
  getThumbnailAsset,
} from "../utils/stac";

export default function ValueCard({ value }: { value: StacValue }) {
  const href = getSelfHref(value);
  const setHref = useStore((store) => store.setHref);
  const hoveredCollection = useStore((store) => store.hoveredCollection);
  const setHoveredCollection = useStore((store) => store.setHoveredCollection);
  const thumbnailAsset = getThumbnailAsset(value);
  const description = "description" in value ? value.description : undefined;

  const isCollection = value.type === "Collection";
  const collection = isCollection ? (value as StacCollection) : null;
  const hovered = isCollection && hoveredCollection === collection;

  return (
    <Card.Root
      borderWidth={isCollection ? 2 : undefined}
      borderColor={hovered ? "colorPalette.solid" : "transparent"}
      cursor={"pointer"}
      onClick={() => href && setHref(href)}
      onMouseEnter={() => collection && setHoveredCollection(collection)}
      onMouseLeave={() => {
        if (hoveredCollection === collection) setHoveredCollection(null);
      }}
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
