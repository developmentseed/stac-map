import { MarkdownHooks } from "react-markdown";
import { Card, Link, Stack, Text } from "@chakra-ui/react";
import type { StacCatalog } from "stac-ts";

export default function Catalogs({
  catalogs,
  setHref,
}: {
  catalogs: StacCatalog[];
  setHref: (href: string | undefined) => void;
}) {
  return (
    <Stack>
      {catalogs.map((catalog) => (
        <CatalogCard
          key={"catalog-" + catalog.id}
          catalog={catalog}
          setHref={setHref}
        />
      ))}
    </Stack>
  );
}

export function CatalogCard({
  catalog,
  setHref,
}: {
  catalog: StacCatalog;
  setHref: (href: string | undefined) => void;
}) {
  const selfHref = catalog.links.find((link) => link.rel === "self")?.href;
  return (
    <Card.Root size={"sm"} variant={"elevated"}>
      <Card.Body>
        <Card.Title>
          <Link onClick={() => selfHref && setHref(selfHref)}>
            {catalog.title || catalog.id}
          </Link>
        </Card.Title>
        <Card.Description as={"div"}>
          <Stack>
            <Text lineClamp={2} as={"div"}>
              <MarkdownHooks>{catalog.description}</MarkdownHooks>
            </Text>
          </Stack>
        </Card.Description>
      </Card.Body>
    </Card.Root>
  );
}
