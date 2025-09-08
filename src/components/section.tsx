import { Collapsible, HStack, Heading, Icon } from "@chakra-ui/react";
import { type ReactNode, useState } from "react";
import { LuChevronDown, LuChevronRight } from "react-icons/lu";

export default function Section({
  title,
  titleSize = "lg",
  children,
}: {
  title: ReactNode;
  titleSize?:
    | "sm"
    | "md"
    | "lg"
    | "xl"
    | "2xl"
    | "xs"
    | "3xl"
    | "4xl"
    | "5xl"
    | "6xl"
    | "7xl"
    | undefined;
  children: ReactNode;
}) {
  const [open, isOpen] = useState(true);
  return (
    <Collapsible.Root
      open={open}
      onOpenChange={(details) => isOpen(details.open)}
    >
      <Collapsible.Trigger>
        <HStack pb={4}>
          <Heading size={titleSize} textAlign="left">
            {title}
          </Heading>
          <Icon size={"sm"}>
            {(open && <LuChevronDown></LuChevronDown>) || (
              <LuChevronRight></LuChevronRight>
            )}
          </Icon>
        </HStack>
      </Collapsible.Trigger>
      <Collapsible.Content pb={4}>{children}</Collapsible.Content>
    </Collapsible.Root>
  );
}
