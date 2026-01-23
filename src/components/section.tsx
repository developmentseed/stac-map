import {
  Box,
  Collapsible,
  Heading,
  HStack,
  IconButton,
  SegmentGroup,
  Stack,
} from "@chakra-ui/react";
import { type ReactNode, useState } from "react";
import { LuChevronDown, LuChevronUp, LuList, LuSquare } from "react-icons/lu";

export type ListOrCard = "list" | "card";

interface SectionBaseProps {
  icon: ReactNode;
  title: ReactNode;
  count?: number;
  filteredCount?: number;
  collapsible?: boolean;
}

interface SectionWithToggleProps extends SectionBaseProps {
  defaultListOrCard?: ListOrCard;
  children: (listOrCard: ListOrCard) => ReactNode;
}

interface SectionWithoutToggleProps extends SectionBaseProps {
  defaultListOrCard?: never;
  children: ReactNode;
}

type SectionProps = SectionWithToggleProps | SectionWithoutToggleProps;

export function Section({
  icon,
  title,
  count,
  filteredCount,
  collapsible = true,
  defaultListOrCard = "card",
  children,
}: SectionProps) {
  const [listOrCard, setListOrCard] = useState<ListOrCard>(defaultListOrCard);
  const [open, setOpen] = useState(true);

  const showToggle = typeof children === "function";
  const content = showToggle ? children(listOrCard) : children;

  if (!collapsible) {
    return (
      <Stack>
        <SectionHeader
          icon={icon}
          title={title}
          count={count}
          filteredCount={filteredCount}
          showToggle={showToggle}
          listOrCard={listOrCard}
          setListOrCard={setListOrCard}
          showCollapse={false}
          open={true}
        />
        {content}
      </Stack>
    );
  }

  return (
    <Collapsible.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
      <Stack>
        <SectionHeader
          icon={icon}
          title={title}
          count={count}
          filteredCount={filteredCount}
          showToggle={showToggle}
          listOrCard={listOrCard}
          setListOrCard={setListOrCard}
          showCollapse={true}
          open={open}
        />
        <Collapsible.Content>{content}</Collapsible.Content>
      </Stack>
    </Collapsible.Root>
  );
}

interface SectionHeaderProps {
  icon: ReactNode;
  title: ReactNode;
  count?: number;
  filteredCount?: number;
  showToggle: boolean;
  listOrCard: ListOrCard;
  setListOrCard: (value: ListOrCard) => void;
  showCollapse: boolean;
  open: boolean;
}

function SectionHeader({
  icon,
  title,
  count,
  filteredCount,
  showToggle,
  listOrCard,
  setListOrCard,
  showCollapse,
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
      {showToggle && (
        <SegmentGroup.Root
          value={listOrCard}
          onValueChange={(e) =>
            setListOrCard((e.value as ListOrCard) || "card")
          }
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
      )}
      {showCollapse && (
        <Collapsible.Trigger asChild>
          <IconButton variant={"ghost"} size={"xs"}>
            {open ? <LuChevronUp /> : <LuChevronDown />}
          </IconButton>
        </Collapsible.Trigger>
      )}
    </HStack>
  );
}
