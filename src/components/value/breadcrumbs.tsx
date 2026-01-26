import { StacIcon } from "@/components/ui/stac";
import { useStacJson } from "@/hooks/stac";
import { useStore } from "@/store";
import type { StacValue } from "@/types/stac";
import { getLink, getStacValueTitle, getStacValueType } from "@/utils/stac";
import { Breadcrumb, HStack } from "@chakra-ui/react";
import { useMemo } from "react";
import type { StacLink } from "stac-ts";

export default function Breadcrumbs({ value }: { value: StacValue }) {
  return (
    <Breadcrumb.Root size={"sm"}>
      <Breadcrumb.List flexWrap="wrap">
        {getBreadcrumbLink(value)}
        <Breadcrumb.Item>
          <Breadcrumb.CurrentLink>
            <HStack whiteSpace="nowrap">{getStacValueType(value)}</HStack>
          </Breadcrumb.CurrentLink>
        </Breadcrumb.Item>
      </Breadcrumb.List>
    </Breadcrumb.Root>
  );
}

function BreadcrumbLink({
  link,
  root = false,
}: {
  link: StacLink;
  root?: boolean;
}) {
  const setHref = useStore((store) => store.setHref);
  const result = useStacJson({ href: link.href });
  const text = useMemo(() => {
    return result.data ? (
      <HStack gap={1} whiteSpace="nowrap">
        <StacIcon value={result.data} />
        <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
          {getStacValueTitle(result.data)}
        </span>
      </HStack>
    ) : (
      link.rel.charAt(0).toUpperCase() + link.rel.slice(1)
    );
  }, [result.data, link.rel]);

  return (
    <>
      {result.data && !root && getBreadcrumbLink(result.data)}
      <Breadcrumb.Item>
        <Breadcrumb.Link
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setHref(link.href);
          }}
        >
          {text}
        </Breadcrumb.Link>
      </Breadcrumb.Item>
      <Breadcrumb.Separator />
    </>
  );
}

function getBreadcrumbLink(value: StacValue) {
  const selfLink = getLink(value, "self");
  const rootLink = getLink(value, "root");
  const parentLink = getLink(value, "parent");
  const collectionLink = getLink(value, "collection");

  return collectionLink && collectionLink.href !== selfLink?.href ? (
    <BreadcrumbLink link={collectionLink} />
  ) : parentLink &&
    parentLink.href !== rootLink?.href &&
    parentLink.href !== selfLink?.href ? (
    <BreadcrumbLink link={parentLink} />
  ) : (
    rootLink &&
    rootLink.href !== selfLink?.href && <BreadcrumbLink link={rootLink} root />
  );
}
