import { LuArrowUpToLine, LuExternalLink, LuLink } from "react-icons/lu";
import { ButtonGroup, IconButton, Link, List, Span } from "@chakra-ui/react";
import type { StacLink } from "stac-ts";
import Section from "../section";

const SET_HREF_REL_TYPES = [
  "root",
  "parent",
  "child",
  "collection",
  "item",
  "search",
  "items",
];

interface LinksProps {
  links: StacLink[];
  setHref: (href: string | undefined) => void;
}

export default function LinksSection({ ...props }: LinksProps) {
  return (
    <Section title="Links" TitleIcon={LuLink} value="links">
      <Links {...props} />
    </Section>
  );
}

function Links({ links, setHref }: LinksProps) {
  return (
    <List.Root variant={"plain"} gap={2}>
      {links.map((link, i) => (
        <List.Item key={"link-" + i} w="full">
          <Span flex={"1"}>
            {link.rel + (link.method ? ` (${link.method})` : "")}
          </Span>
          <ButtonGroup size={"2xs"} variant={"outline"}>
            {SET_HREF_REL_TYPES.includes(link.rel) &&
              (!link.method || link.method === "GET") && (
                <Link
                  onClick={(e) => {
                    e.preventDefault();
                    setHref(link.href);
                  }}
                >
                  <IconButton>
                    <LuArrowUpToLine />
                  </IconButton>
                </Link>
              )}
            <Link href={link.href} target="_blank">
              <IconButton>
                <LuExternalLink />
              </IconButton>
            </Link>
          </ButtonGroup>
        </List.Item>
      ))}
    </List.Root>
  );
}
