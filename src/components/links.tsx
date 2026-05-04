import { useStore } from "@/store";
import { Badge, Button, Link, Wrap } from "@chakra-ui/react";
import { LuLink2 } from "react-icons/lu";
import type { StacLink } from "stac-ts";
import Section from "./ui/section";

const HEIRARCHICAL_LINKS = [
  "root",
  "self",
  "parent",
  "collection",
  "data",
  "child",
  "item",
  "items",
  "next",
  "previous",
];

export default function Links({ links }: { links: StacLink[] }) {
  const setHref = useStore((store) => store.setHref);

  return (
    <Section icon={<LuLink2 />} title="Links">
      <Wrap>
        {links.map((link, i) => {
          const isHierarchical = HEIRARCHICAL_LINKS.includes(link.rel);
          return (
            <Button
              key={link.href + "-" + i}
              size={"sm"}
              variant={"surface"}
              asChild
            >
              <Link
                href={link.href}
                onClick={
                  isHierarchical
                    ? (e) => {
                        e.preventDefault();
                        setHref(link.href);
                      }
                    : undefined
                }
                target={isHierarchical ? undefined : "_blank"}
              >
                {link.title}
                {link.rel && <Badge>{link.rel}</Badge>}
                {link.type && <Badge>{link.type}</Badge>}
              </Link>
            </Button>
          );
        })}
      </Wrap>
    </Section>
  );
}
