import { useState } from "react";
import { LuSearch } from "react-icons/lu";
import { Stack } from "@chakra-ui/react";
import type { StacCollection } from "stac-ts";
import SectionHeader, { type ListOrCard } from "./section-header";

interface Props {
  href: string;
  collection: StacCollection;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function Search(_props: Props) {
  const [listOrCard, setListOrCard] = useState<ListOrCard>("card");

  return (
    <Stack gap={4}>
      <SectionHeader
        icon={<LuSearch />}
        title="Search"
        listOrCard={listOrCard}
        setListOrCard={setListOrCard}
      />
    </Stack>
  );
}
