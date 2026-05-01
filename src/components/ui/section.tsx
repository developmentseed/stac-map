import { Collapsible, HStack } from "@chakra-ui/react";
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
    <Collapsible.Root defaultOpen>
      <Collapsible.Trigger display="flex" gap={2} py={2} cursor={"pointer"}>
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
      <Collapsible.Content>{children}</Collapsible.Content>
    </Collapsible.Root>
  );
}
