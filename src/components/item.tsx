import { HStack, Icon, Stack } from "@chakra-ui/react";
import { LuFileImage } from "react-icons/lu";
import type { StacItem } from "stac-ts";
import Assets from "./assets";
import Section from "./section";
import Value from "./value";

export default function Item({ item }: { item: StacItem }) {
  return (
    <Stack>
      <Value value={item}></Value>
      <Section
        title={
          <HStack>
            <Icon>
              <LuFileImage></LuFileImage>
            </Icon>{" "}
            Assets
          </HStack>
        }
      >
        <Assets assets={item.assets}></Assets>
      </Section>
    </Stack>
  );
}
