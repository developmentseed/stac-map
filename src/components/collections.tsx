import { MarkdownHooks } from "react-markdown";
import { Card, Link, Stack, Text } from "@chakra-ui/react";
import type { StacCollection } from "stac-ts";
import { SpatialExtent, TemporalExtent } from "./extent";

export default function Collections({
  collections,
  setHref,
}: {
  collections: StacCollection[];
  setHref: (href: string | undefined) => void;
}) {
  return (
    <Stack>
      {collections.map((collection) => (
        <CollectionCard
          key={"collection-" + collection.id}
          collection={collection}
          setHref={setHref}
        />
      ))}
    </Stack>
  );
}

export function CollectionCard({
  collection,
  setHref,
  footer,
}: {
  collection: StacCollection;
  setHref: (href: string | undefined) => void;
  footer?: string;
}) {
  const selfHref = collection.links.find((link) => link.rel === "self")?.href;
  return (
    <Card.Root size={"sm"} variant={"elevated"}>
      <Card.Body>
        <Card.Title>
          <Link onClick={() => selfHref && setHref(selfHref)}>
            {collection.title || collection.id}
          </Link>
        </Card.Title>
        <Card.Description as={"div"}>
          <Stack>
            <Text lineClamp={2} as={"div"}>
              <MarkdownHooks>{collection.description}</MarkdownHooks>
            </Text>

            {collection.extent?.temporal?.interval && (
              <TemporalExtent
                interval={collection.extent.temporal.interval[0]}
              ></TemporalExtent>
            )}
            {collection.extent?.spatial?.bbox && (
              <SpatialExtent
                bbox={collection.extent.spatial.bbox[0]}
              ></SpatialExtent>
            )}
          </Stack>
        </Card.Description>
      </Card.Body>
      {footer && (
        <Card.Footer fontWeight={"lighter"} fontSize={"sm"}>
          {footer}
        </Card.Footer>
      )}
    </Card.Root>
  );
}
