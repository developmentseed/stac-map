import { Box, Collapsible, HStack } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { LuChevronRight } from "react-icons/lu";

export default function Section({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <Collapsible.Root
      defaultOpen
      borderTopWidth={"1px"}
      borderColor={"border.emphasized"}
    >
      <Collapsible.Trigger
        display="flex"
        gap={0}
        pt={4}
        pb={2}
        cursor={"pointer"}
      >
        <HStack>
          <Collapsible.Indicator
            transition="transform 0.2s"
            _open={{ transform: "rotate(90deg)" }}
          >
            <LuChevronRight />
          </Collapsible.Indicator>
          {icon}
          {title}
        </HStack>
      </Collapsible.Trigger>
      <Collapsible.Content>
        <Box py={2}>{children}</Box>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}
