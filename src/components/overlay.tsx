import { Button, GridItem, HStack, SimpleGrid } from "@chakra-ui/react";
import { Examples } from "./examples";
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
          <Examples>
            <Button bg={"bg.muted/90"} variant={"outline"}>
              Examples
            </Button>
          </Examples>
          <ColorModeButton variant={"surface"} />
        </HStack>
      </GridItem>
    </SimpleGrid>
  );
}
