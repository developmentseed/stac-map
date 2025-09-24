import { Collapsible, HStack, Heading, Icon } from "@chakra-ui/react";
import { type ReactNode, useState } from "react";
import type { IconType } from "react-icons/lib";
import { LuChevronDown, LuChevronRight } from "react-icons/lu";

export default function Section({
  title,
  TitleIcon,
  titleSize = "lg",
  children,
}: {
  title: ReactNode;
  TitleIcon?: IconType;
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
            <HStack>
              {TitleIcon && (
                <Icon>
                  <TitleIcon></TitleIcon>
                </Icon>
              )}
              {title}
            </HStack>
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
