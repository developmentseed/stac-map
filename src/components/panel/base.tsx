import { Box, HStack, Span } from "@chakra-ui/react";
import type { ReactNode } from "react";

export function PanelHeader({
  icon,
  children,
  actions,
}: {
  icon?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <HStack>
      {icon}
      <Span flex={1} truncate>
        {children}
      </Span>
      {actions}
    </HStack>
  );
}

export function BasePanel({
  header,
  children,
}: {
  header: ReactNode;
  children: ReactNode;
}) {
  return (
    <Box
      bg={"bg.muted"}
      pointerEvents={"auto"}
      rounded={4}
      borderColor={"bg.emphasized"}
    >
      <Box
        borderBottomWidth={1}
        borderColor={"border.subtle"}
        py={2}
        px={4}
        fontWeight={"lighter"}
        fontSize={"sm"}
      >
        {header}
      </Box>
      <Box p={4} overflow={"scroll"} maxH={"80dvh"}>
        {children}
      </Box>
    </Box>
  );
}
