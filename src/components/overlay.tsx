import { GridItem, HStack, SimpleGrid } from "@chakra-ui/react";
import HrefInput from "./href-input";
import Panel from "./panel";
import { ColorModeButton } from "./ui/color-mode";

export default function Overlay() {
  return (
    <SimpleGrid columns={3} gap={4}>
      <GridItem colSpan={1}>
        <Panel />
      </GridItem>
      <GridItem colSpan={2}>
        <HStack pointerEvents={"auto"}>
          <HrefInput />
          <ColorModeButton variant={"surface"} />
        </HStack>
      </GridItem>
    </SimpleGrid>
  );
}
