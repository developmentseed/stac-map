import { Card, HStack, IconButton, SegmentGroup, Span } from "@chakra-ui/react";
import { useState, type ReactNode } from "react";
import { LuChevronDown, LuChevronUp, LuList, LuSquare } from "react-icons/lu";

export type ListOrCard = "list" | "card";

interface SectionProps {
  icon: ReactNode;
  title: ReactNode;
  defaultListOrCard?: ListOrCard;
  open?: boolean;
  headerAction?: ReactNode;
  children: ReactNode | ((listOrCard: ListOrCard) => ReactNode);
}

export function Section({
  icon,
  title,
  children,
  defaultListOrCard = "card",
  open = true,
  headerAction,
}: SectionProps) {
  const [listOrCard, setListOrCard] = useState<ListOrCard>(defaultListOrCard);
  const [isOpen, setIsOpen] = useState(open);
  const showListOrCard = typeof children === "function";
  const description = showListOrCard ? children(listOrCard) : children;

  return (
    <Card.Root size={"sm"} variant={"outline"}>
      <Card.Body gap={4}>
        <Card.Title
          onClick={() => setIsOpen((isOpen) => !isOpen)}
          cursor={"pointer"}
        >
          <HStack>
            {icon}
            {title}
            <Span flex={1} />
            {headerAction}
            {showListOrCard && (
              <ListOrCardToggle
                listOrCard={listOrCard}
                setListOrCard={setListOrCard}
              />
            )}
            <IconButton size={"2xs"} variant={"ghost"}>
              {isOpen ? <LuChevronUp /> : <LuChevronDown />}
            </IconButton>
          </HStack>
        </Card.Title>
        <Card.Description
          as={"div"}
          display={isOpen ? "block" : "none"}
          truncate
        >
          {description}
        </Card.Description>
      </Card.Body>
    </Card.Root>
  );
}

function ListOrCardToggle({
  listOrCard,
  setListOrCard,
}: {
  listOrCard: ListOrCard;
  setListOrCard: (listOrCard: ListOrCard) => void;
}) {
  return (
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
  );
}
