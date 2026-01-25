import { GridItem, SimpleGrid } from "@chakra-ui/react";
import Header from "./header";
import Panel from "./panel";

export default function Overlay() {
  return (
    <SimpleGrid columns={3} gap={4}>
      <GridItem colSpan={1}>
        <Panel />
      </GridItem>
      <GridItem colSpan={2}>
        <Header />
      </GridItem>
    </SimpleGrid>
  );
}
