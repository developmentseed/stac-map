import { Card, Heading, Link, Stack, Text } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { MarkdownHooks } from "react-markdown";
import type { StacCatalog, StacCollection } from "stac-ts";
import useStacMap from "../hooks/stac-map";

export function Children({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  return (
    <Stack>
      <Heading size={"md"}>{heading}</Heading>
      {children}
    </Stack>
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
