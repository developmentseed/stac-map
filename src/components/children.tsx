import { Card, HStack, Icon, Link, Stack, Text } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { LuFolderPlus, LuFolderSearch } from "react-icons/lu";
import { MarkdownHooks } from "react-markdown";
import type { StacCatalog, StacCollection } from "stac-ts";
import useStacMap from "../hooks/stac-map";
import { CollectionSearch } from "./search/collection";
import Section from "./section";

export function Children({ value }: { value: StacCatalog | StacCollection }) {
  const { catalogs, collections } = useStacMap();
  const selfHref = value?.links?.find((link) => link.rel === "self")?.href;

  return (
    <>
      {collections && collections?.length > 0 && (
        <Section
          title={
            <HStack>
              <Icon>
                <LuFolderSearch></LuFolderSearch>
              </Icon>{" "}
              Collection search
            </HStack>
          }
        >
          <CollectionSearch
            href={selfHref}
            collections={collections}
          ></CollectionSearch>
        </Section>
      )}

      {catalogs && catalogs.length > 0 && (
        <Section title="Catalogs">
          <Stack>
            {catalogs.map((catalog) => (
              <ChildCard
                child={catalog}
                key={"catalog-" + catalog.id}
              ></ChildCard>
            ))}
          </Stack>
        </Section>
      )}

      {collections && collections.length > 0 && (
        <Section
          title={
            <HStack>
              <Icon>
                <LuFolderPlus></LuFolderPlus>
              </Icon>{" "}
              Collections ({collections.length})
            </HStack>
          }
        >
          <Stack>
            {collections.map((collection) => (
              <ChildCard
                child={collection}
                key={"collection-" + collection.id}
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
}: {
  child: StacCatalog | StacCollection;
  footer?: ReactNode;
}) {
  const { setHref } = useStacMap();
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
