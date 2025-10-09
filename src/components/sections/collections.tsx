import { LuFolderPlus } from "react-icons/lu";
import { Stack } from "@chakra-ui/react";
import type { StacCollection } from "stac-ts";
import CollectionCard from "../cards/collection";
import Section from "../section";

interface CollectionsProps {
  collections: StacCollection[];
  setHref: (href: string | undefined) => void;
}

export default function CollectionsSection({
  collections,
  filteredCollections,
  numberOfCollections,
  setHref,
}: {
  filteredCollections: StacCollection[] | undefined;
  numberOfCollections: number | undefined;
} & CollectionsProps) {
  const parenthetical = filteredCollections
    ? `${filteredCollections.length}/${numberOfCollections || collections.length}`
    : collections.length;
  const title = `Collections (${parenthetical})`;
  return (
    <Section title={title} TitleIcon={LuFolderPlus} value="collections">
      <Collections
        collections={filteredCollections || collections}
        setHref={setHref}
      />
    </Section>
  );
}

function Collections({ collections, setHref }: CollectionsProps) {
  return (
    <Stack>
      {collections.map((collection) => (
        <CollectionCard
          key={"collection-" + collection.id}
          collection={collection}
          setHref={setHref}
        />
      ))}
    </Stack>
  );
}
