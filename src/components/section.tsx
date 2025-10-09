import { type ReactNode } from "react";
import { type IconType } from "react-icons/lib";
import { Accordion, HStack, Icon } from "@chakra-ui/react";

export default function Section({
  title,
  TitleIcon,
  value,
  children,
}: {
  title: ReactNode;
  TitleIcon: IconType;
  value: string;
  children: ReactNode;
}) {
  return (
    <Accordion.Item value={value}>
      <Accordion.ItemTrigger>
        <HStack flex={"1"}>
          <Icon>
            <TitleIcon />
          </Icon>{" "}
          {title}
        </HStack>
        <Accordion.ItemIndicator />
      </Accordion.ItemTrigger>
      <Accordion.ItemContent>
        <Accordion.ItemBody>{children}</Accordion.ItemBody>
      </Accordion.ItemContent>
    </Accordion.Item>
  );
}
