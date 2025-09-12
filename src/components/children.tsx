import { Card, HStack, Icon, Link, Stack, Text } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { LuFolderPlus, LuFolderSearch } from "react-icons/lu";
import { MarkdownHooks } from "react-markdown";
import type { StacCatalog, StacCollection } from "stac-ts";
import useStacMap from "../hooks/stac-map";
import { useChildren } from "../hooks/stac-value";
import type { SetHref } from "../types/app";
import { CollectionSearch } from "./search/collection";
import Section from "./section";

export function Children({
  value,
  setHref,
}: {
  value: StacCatalog | StacCollection;
  setHref: SetHref;
}) {
  const { collections } = useStacMap();
  const children = useChildren(value, !!collections);
  const selfHref = value?.links?.find((link) => link.rel === "self")?.href;

  return (
    <>
      {collections && collections?.length > 0 && (
        <>
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
              setHref={setHref}
              collections={collections}
            ></CollectionSearch>
          </Section>

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
