import { Breadcrumb } from "@chakra-ui/react";
import type { StacValue } from "../types/stac";

export default function Breadcrumbs({
  value,
  picked,
  setPicked,
  setHref,
}: {
  value: StacValue;
  picked: StacValue | undefined;
  setPicked: (picked: StacValue | undefined) => void;
  setHref: (href: string | undefined) => void;
}) {
  let selfHref;
  let rootHref;
  let parentHref;
  if (value.links) {
    for (const link of value.links) {
      switch (link.rel) {
        case "self":
          selfHref = link.href;
          break;
        case "parent":
          parentHref = link.href;
          break;
        case "root":
          rootHref = link.href;
          break;
      }
    }
  }
  const breadcrumbs = [];
  if (rootHref && selfHref != rootHref) {
    breadcrumbs.push(
      <BreadcrumbItem
        href={rootHref}
        setHref={setHref}
        key={"root"}
        text={"Root"}
      ></BreadcrumbItem>
    );
  }
  if (parentHref && selfHref != parentHref && rootHref != parentHref) {
    breadcrumbs.push(
      <BreadcrumbItem
        href={parentHref}
        setHref={setHref}
        key={"parent"}
        text={"Parent"}
      ></BreadcrumbItem>
    );
  }
  if (picked) {
    breadcrumbs.push(
      <Breadcrumb.Item key={"value"}>
        <Breadcrumb.Link
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setPicked(undefined);
          }}
        >
          {getStacType(value)}
        </Breadcrumb.Link>
      </Breadcrumb.Item>
    );
    breadcrumbs.push(
      <Breadcrumb.Item key={"picked"}>
        <Breadcrumb.CurrentLink>
          {"Picked " + getStacType(picked).toLowerCase()}
        </Breadcrumb.CurrentLink>
      </Breadcrumb.Item>
    );
  } else {
    breadcrumbs.push(
      <Breadcrumb.Item key={"value"}>
        <Breadcrumb.CurrentLink>{getStacType(value)}</Breadcrumb.CurrentLink>
      </Breadcrumb.Item>
    );
  }
  return (
    <Breadcrumb.Root>
      <Breadcrumb.List>
        {breadcrumbs.flatMap((value, i) => [
          value,
          i < breadcrumbs.length - 1 && (
            <Breadcrumb.Separator key={"breadcrumb-separator-" + i} />
          ),
        ])}
      </Breadcrumb.List>
    </Breadcrumb.Root>
  );
}

function BreadcrumbItem({
  href,
  setHref,
  text,
}: {
  href: string;
  setHref: (href: string | undefined) => void;
  text: string;
}) {
  return (
    <Breadcrumb.Item>
      <Breadcrumb.Link
        href="#"
        onClick={(e) => {
          e.preventDefault();
          setHref(href);
        }}
      >
        {text}
      </Breadcrumb.Link>
    </Breadcrumb.Item>
  );
}

function getStacType(value: StacValue) {
  switch (value.type) {
    case "Feature":
      return "Item";
    case "FeatureCollection":
      return "Item collection";
    case "Catalog":
    case "Collection":
      return value.type;
    default:
      return "Unknown";
  }
}
