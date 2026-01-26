import { useStore } from "@/store";
import { ButtonGroup, HStack, IconButton, List, Span } from "@chakra-ui/react";
import { LuArrowRight, LuExternalLink, LuLink } from "react-icons/lu";
import type { StacLink } from "stac-ts";
import { Section } from "../section";

const HIERARCHICAL_LINKS = [
  "child",
  "parent",
  "root",
  "collection",
  "item",
  "items",
];

export default function Links({ links }: { links: StacLink[] }) {
  return (
    <Section icon={<LuLink />} title={"Links"} open={false}>
      <List.Root variant={"plain"}>
        {links.map((link, i) => (
          <LinkListItem link={link} key={"link-" + i} />
        ))}
      </List.Root>
    </Section>
  );
}

function LinkListItem({ link }: { link: StacLink }) {
  const setHref = useStore((store) => store.setHref);

  return (
    <List.Item display={"block"}>
      <HStack>
        <Span flex={1}>{link.title || link.rel}</Span>
        <ButtonGroup variant={"plain"} size="2xs">
          {HIERARCHICAL_LINKS.includes(link.rel) && (
            <IconButton onClick={() => setHref(link.href)}>
              <LuArrowRight />
            </IconButton>
          )}
          <IconButton asChild>
            <a href={link.href} target="_blank">
              <LuExternalLink />
            </a>
          </IconButton>
        </ButtonGroup>
      </HStack>
    </List.Item>
  );
}
