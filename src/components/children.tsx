import { Card, Checkbox, Link, Stack, Text } from "@chakra-ui/react";
import { useEffect, useState, type ReactNode } from "react";
import { LuFolderPlus, LuFolderSearch } from "react-icons/lu";
import { MarkdownHooks } from "react-markdown";
import type { StacCatalog, StacCollection } from "stac-ts";
import useStacMap from "../hooks/stac-map";
import { useChildren } from "../hooks/stac-value";
import type { SetHref } from "../types/app";
import { CollectionSearch } from "./search/collection";
import Section from "./section";
import { useMap } from "react-map-gl/maplibre";
import type { BBox } from "geojson";

export function Children({
  value,
  setHref,
}: {
  value: StacCatalog | StacCollection;
  setHref: SetHref;
}) {
  const { collections } = useStacMap();
  const children = useChildren(value, !collections);
  const { map } = useMap();
  const selfHref = value?.links?.find((link) => link.rel === "self")?.href;
  const [mapBbox, setMapBbox] = useState<BBox>();
  const [filterByViewport, setFilterByViewport] = useState(true);
  const [filteredCollections, setFilteredCollections] = useState(collections);

  useEffect(() => {
    if (map) {
      map.on("moveend", () => {
        if (map) {
          setMapBbox(map.getBounds().toArray().flat() as BBox);
        }
      });
    }
  }, [map]);

  useEffect(() => {
    if (filterByViewport && mapBbox) {
      setFilteredCollections(
        collections?.filter((collection) =>
          isCollectionInBbox(collection, mapBbox),
        ),
      );
    } else {
      setFilteredCollections(collections);
    }
  }, [collections, filterByViewport, mapBbox]);

  return (
    <>
      {collections &&
        filteredCollections &&
        filteredCollections?.length > 0 && (
          <>
            <Section TitleIcon={LuFolderSearch} title={"Collection search"}>
              <CollectionSearch
                href={selfHref}
                setHref={setHref}
                collections={filteredCollections}
              ></CollectionSearch>
            </Section>

            <Section
              TitleIcon={LuFolderPlus}
              title={
                "Collections (" +
                ((filterByViewport &&
                  filteredCollections.length + "/" + collections.length) ||
                  collections.length) +
                ")"
              }
            >
              <Stack>
                <Checkbox.Root
                  mb={2}
                  size={"sm"}
                  checked={filterByViewport}
                  onCheckedChange={(e) => setFilterByViewport(!!e.checked)}
                >
                  <Checkbox.HiddenInput></Checkbox.HiddenInput>
                  <Checkbox.Control></Checkbox.Control>
                  <Checkbox.Label>Filter by viewport</Checkbox.Label>
                </Checkbox.Root>
                {filteredCollections.map((collection) => (
                  <ChildCard
                    child={collection}
                    setHref={setHref}
                    key={"collection-" + collection.id}
                  ></ChildCard>
                ))}
              </Stack>
            </Section>
          </>
        )}

      {children && children.length > 0 && (
        <Section title="Children">
          <Stack>
            {children.map((child) => (
              <ChildCard
                child={child}
                setHref={setHref}
                key={"child-" + child.id}
              ></ChildCard>
            ))}
          </Stack>
        </Section>
      )}
    </>
  );
}

export function ChildCard({
  child,
  footer,
  setHref,
}: {
  child: StacCatalog | StacCollection;
  footer?: ReactNode;
  setHref: SetHref;
}) {
  const selfHref = child.links.find((link) => link.rel === "self")?.href;

  return (
    <Card.Root size={"sm"}>
      <Card.Body>
        <Card.Title>
          <Link onClick={() => selfHref && setHref(selfHref)}>
            {child.title || child.id}
          </Link>
        </Card.Title>
        <Card.Description as={"div"}>
          <Text lineClamp={2} as={"div"}>
            <MarkdownHooks>{child.description}</MarkdownHooks>
          </Text>
        </Card.Description>
      </Card.Body>
      {footer && (
        <Card.Footer fontSize={"xs"} fontWeight={"lighter"}>
          {footer}
        </Card.Footer>
      )}
    </Card.Root>
  );
}

function isCollectionInBbox(collection: StacCollection, bbox: BBox) {
  if (bbox[2] - bbox[0] >= 360) {
    // A global bbox always contains every collection
    return true;
  }
  const collectionBbox = collection?.extent?.spatial?.bbox?.[0];
  if (collectionBbox) {
    return (
      !(
        collectionBbox[0] < bbox[0] &&
        collectionBbox[1] < bbox[1] &&
        collectionBbox[2] > bbox[2] &&
        collectionBbox[3] > bbox[3]
      ) &&
      !(
        collectionBbox[0] > bbox[2] ||
        collectionBbox[1] > bbox[3] ||
        collectionBbox[2] < bbox[0] ||
        collectionBbox[3] < bbox[1]
      )
    );
  } else {
    return false;
  }
}
