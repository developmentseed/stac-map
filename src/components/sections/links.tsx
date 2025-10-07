import { LuArrowUpToLine, LuExternalLink } from "react-icons/lu";
import { ButtonGroup, IconButton, Link, List, Span } from "@chakra-ui/react";
import type { StacLink } from "stac-ts";

const SET_HREF_REL_TYPES = [
  "root",
  "parent",
  "child",
  "collection",
  "item",
  "search",
  "items",
];

export default function Links({
  links,
  setHref,
}: {
  links: StacLink[];
  setHref: (href: string | undefined) => void;
}) {
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
