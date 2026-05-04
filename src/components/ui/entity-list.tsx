import {
  EmptyState,
  HStack,
  IconButton,
  List,
  Popover,
  Portal,
  SegmentGroup,
  Span,
  Stack,
} from "@chakra-ui/react";
import { Fragment, type ReactNode, useState } from "react";
import { LuList, LuListFilter, LuPackageOpen, LuSquare } from "react-icons/lu";

type View = "list" | "card";

export default function EntityList<T>({
  items,
  getKey,
  renderCard,
  renderListItem,
  filters,
  defaultView,
}: {
  items: T[];
  getKey: (item: T) => string;
  renderCard: (item: T) => ReactNode;
  renderListItem: (item: T) => ReactNode;
  filters?: ReactNode;
  defaultView: View;
}) {
  const [view, setView] = useState<View>(defaultView);

  return (
    <Stack>
      <HStack display={"flex"}>
        <SegmentGroup.Root
          size={"xs"}
          value={view}
          onValueChange={(e) => e.value && setView(e.value as View)}
        >
          <SegmentGroup.Indicator />
          <SegmentGroup.Items
            items={[
              { value: "list", label: <LuList /> },
              { value: "card", label: <LuSquare /> },
            ]}
          />
        </SegmentGroup.Root>
        <Span flex={1} />
        {filters && (
          <Popover.Root>
            <Popover.Trigger asChild>
              <IconButton
                size={"xs"}
                variant={"outline"}
                aria-label={"Filters"}
              >
                <LuListFilter />
              </IconButton>
            </Popover.Trigger>
            <Portal>
              <Popover.Positioner>
                <Popover.Content>
                  <Popover.Arrow />
                  <Popover.Body>
                    <Stack gap={2}>{filters}</Stack>
                  </Popover.Body>
                </Popover.Content>
              </Popover.Positioner>
            </Portal>
          </Popover.Root>
        )}
      </HStack>
      {items.length === 0 ? (
        <EmptyState.Root size={"sm"}>
          <EmptyState.Content>
            <EmptyState.Indicator>
              <LuPackageOpen />
            </EmptyState.Indicator>
            <EmptyState.Title>Nothing to see here</EmptyState.Title>
          </EmptyState.Content>
        </EmptyState.Root>
      ) : view === "card" ? (
        <Stack>
          {items.map((item) => (
            <Fragment key={getKey(item)}>{renderCard(item)}</Fragment>
          ))}
        </Stack>
      ) : (
        <List.Root variant={"plain"}>
          {items.map((item) => (
            <Fragment key={getKey(item)}>{renderListItem(item)}</Fragment>
          ))}
        </List.Root>
      )}
    </Stack>
  );
}
