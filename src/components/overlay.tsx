import { Container, GridItem, SimpleGrid } from "@chakra-ui/react";
import Header from "./header";
import Panel from "./panel";

export default function Overlay() {
  return (
    <Container
      zIndex={1}
      fluid
      h="calc(100dvh - var(--header-height, 0px))"
      pointerEvents={"none"}
      position={"absolute"}
      top="var(--header-height, 0px)"
      left={0}
      pt={4}
    >
      <SimpleGrid columns={3} gap={4}>
        <GridItem colSpan={1}>
          <Panel />
        </GridItem>
        <GridItem colSpan={2}>
          <Header />
        </GridItem>
      </SimpleGrid>
    </Container>
  );
}
