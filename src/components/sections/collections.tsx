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
  collectionsNumberMatched,
  totalNumOfCollections,
  setHref,
}: {
  collectionsNumberMatched: number | undefined;
  totalNumOfCollections: number | undefined;
} & CollectionsProps) {
  const parenthetical =
    collections.length !== collectionsNumberMatched
      ? `${collections.length}/${collectionsNumberMatched || totalNumOfCollections}`
      : collections.length;
  const title = `Collections (${parenthetical})`;
  return (
    <Section title={title} TitleIcon={LuFolderPlus} value="collections">
      <Collections collections={collections} setHref={setHref} />
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
