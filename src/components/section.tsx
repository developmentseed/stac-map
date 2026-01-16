import { type ReactNode, useState } from "react";
import { LuChevronDown, LuChevronUp, LuList, LuSquare } from "react-icons/lu";
import {
  Box,
  Collapsible,
  Heading,
  HStack,
  IconButton,
  SegmentGroup,
  Stack,
} from "@chakra-ui/react";

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
  const [open, setOpen] = useState(true);

  return (
    <Collapsible.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
      <Stack gap={4}>
        <SectionHeader
          icon={icon}
          title={title}
          count={count}
          filteredCount={filteredCount}
          listOrCard={listOrCard}
          setListOrCard={setListOrCard}
          open={open}
        />
        <Collapsible.Content>
          <Stack gap={4}>{children(listOrCard)}</Stack>
        </Collapsible.Content>
      </Stack>
    </Collapsible.Root>
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
  open: boolean;
}

function SectionHeader({
  icon,
  title,
  count,
  filteredCount,
  listOrCard,
  setListOrCard,
  open,
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
      <Collapsible.Trigger asChild>
        <IconButton variant={"ghost"} size={"xs"}>
          {open ? <LuChevronUp /> : <LuChevronDown />}
        </IconButton>
      </Collapsible.Trigger>
    </HStack>
  );
}
