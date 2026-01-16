import { type ReactNode, useState } from "react";
import { LuList, LuSquare } from "react-icons/lu";
import { Box, Heading, HStack, SegmentGroup, Stack } from "@chakra-ui/react";

interface SectionProps {
  icon: ReactNode;
  title: string;
  count?: number;
  filteredCount?: number;
  defaultListOrCard?: ListOrCard;
  children: (listOrCard: ListOrCard) => ReactNode;
}

export function Section({
  icon,
  title,
  count,
  filteredCount,
  defaultListOrCard = "card",
  children,
}: SectionProps) {
  const [listOrCard, setListOrCard] = useState<ListOrCard>(defaultListOrCard);

  return (
    <Stack gap={4}>
      <SectionHeader
        icon={icon}
        title={title}
        count={count}
        filteredCount={filteredCount}
        listOrCard={listOrCard}
        setListOrCard={setListOrCard}
      />
      {children(listOrCard)}
    </Stack>
  );
}

export type ListOrCard = "list" | "card";

interface SectionHeaderProps {
  icon: ReactNode;
  title: string;
  count?: number;
  filteredCount?: number;
  listOrCard: ListOrCard;
  setListOrCard: (value: ListOrCard) => void;
}

function SectionHeader({
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
