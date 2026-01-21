import { useEffect } from "react";
import { LuFolder } from "react-icons/lu";
import { List, SkeletonText, Stack } from "@chakra-ui/react";
import type { StacLink } from "stac-ts";
import CollectionFilter from "./collection-filter";
import { type ListOrCard, Section } from "./section";
import SkeletonCard from "./skeleton-card";
import ValueCard from "./value-card";
import ValueListItem from "./value-list-item";
import { useStacJson } from "../hooks/stac";
import { useStore } from "../store";

export default function Children({ links }: { links: StacLink[] }) {
  const collections = useStore((store) => store.collections);
  const filteredCollections = useStore((store) => store.filteredCollections);

  return (
    <Section
      icon={<LuFolder />}
      title="Children"
      count={collections?.length}
      filteredCount={filteredCollections?.length}
    >
      {(listOrCard) => (
        <>
          <CollectionFilter />
          <ChildrenValues listOrCard={listOrCard} links={links} />
        </>
      )}
    </Section>
  );
}

function ChildrenValues({
  listOrCard,
  links,
}: {
  listOrCard: ListOrCard;
  links: StacLink[];
}) {
  if (listOrCard === "list") {
    return (
      <List.Root variant={"plain"} gap={2}>
        {links.map((link) => (
          <ChildListItem link={link} />
        ))}
      </List.Root>
    );
  } else {
    return (
      <Stack>
        {links.map((link) => (
          <ChildCard link={link} />
        ))}
      </Stack>
    );
  }
}

function ChildCard({ link }: { link: StacLink }) {
  const result = useStacJson({ href: link.href });
  const addCollection = useStore((store) => store.addCollection);
  const filteredCollections = useStore((store) => store.filteredCollections);

  useEffect(() => {
    if (result.data?.type === "Collection") addCollection(result.data);
  }, [result.data, addCollection]);

  if (result.isFetching) {
    return <SkeletonCard />;
  } else if (result.data) {
    if (
      result.data.type === "Collection" &&
      filteredCollections &&
      !filteredCollections.includes(result.data)
    ) {
      return null;
    }
    return <ValueCard value={result.data} />;
  }
}

function ChildListItem({ link }: { link: StacLink }) {
  const result = useStacJson({ href: link.href });
  const addCollection = useStore((store) => store.addCollection);
  const filteredCollections = useStore((store) => store.filteredCollections);

  useEffect(() => {
    if (result.data?.type === "Collection") addCollection(result.data);
  }, [result.data, addCollection]);

  if (result.isFetching) {
    return <SkeletonText noOfLines={1} />;
  } else if (result.data) {
    if (
      result.data.type === "Collection" &&
      filteredCollections &&
      !filteredCollections.includes(result.data)
    ) {
      return null;
    }
    return <ValueListItem value={result.data} />;
  }
}
