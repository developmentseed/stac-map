import type { ReactNode } from "react";
import { LuList, LuSquare } from "react-icons/lu";
import { Box, Heading, HStack, SegmentGroup } from "@chakra-ui/react";

export type ListOrCard = "list" | "card";

interface SectionHeaderProps {
  icon: ReactNode;
  title: string;
  count?: number;
  filteredCount?: number;
  listOrCard: ListOrCard;
  setListOrCard: (value: ListOrCard) => void;
}

export default function SectionHeader({
  icon,
  title,
  count,
  filteredCount,
  listOrCard,
  setListOrCard,
}: SectionHeaderProps) {
  return (
    <HStack>
      <Heading size={"md"}>
        <HStack>
          {icon} {title}{" "}
          {count !== undefined &&
            `(${filteredCount !== undefined ? filteredCount + "/" : ""}${count})`}
        </HStack>
      </Heading>
      <Box flex={1} />
      <SegmentGroup.Root
        value={listOrCard}
        onValueChange={(e) => setListOrCard((e.value as ListOrCard) || "card")}
        size={"xs"}
      >
        <SegmentGroup.Indicator />
        <SegmentGroup.Items
          items={[
            { value: "list", label: <LuList /> },
            { value: "card", label: <LuSquare /> },
          ]}
        />
      </SegmentGroup.Root>
    </HStack>
  );
}
