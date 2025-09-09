import {
  Alert,
  Box,
  Container,
  Flex,
  GridItem,
  SimpleGrid,
} from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import { MapProvider } from "react-map-gl/dist/esm/exports-maplibre";
import Header from "./components/header";
import Map from "./components/map";
import Panel from "./components/panel";
import { Toaster } from "./components/ui/toaster";
import { StacMapProvider } from "./provider";

export default function App() {
  const queryClient = new QueryClient({});

  return (
    <QueryClientProvider client={queryClient}>
      <MapProvider>
        <StacMapProvider>
          <Box zIndex={0} position={"absolute"} top={0} left={0}>
            <ErrorBoundary FallbackComponent={MapFallback}>
              <Map></Map>
            </ErrorBoundary>
          </Box>
          <Container zIndex={1} fluid h={"dvh"} py={4} pointerEvents={"none"}>
            <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
              <GridItem colSpan={1} hideFrom={"md"}>
                <Header></Header>
              </GridItem>
              <GridItem colSpan={1}>
                <Panel></Panel>
              </GridItem>
              <GridItem colSpan={2} hideBelow={"md"}>
                <Header></Header>
              </GridItem>
            </SimpleGrid>
          </Container>
          <Toaster></Toaster>
        </StacMapProvider>
      </MapProvider>
    </QueryClientProvider>
  );
}

function MapFallback({ error }: { error: Error }) {
  return (
    <Flex h={"100dvh"} w={"100dvw"} alignItems="center" justifyContent="center">
      <Box>
        <Alert.Root status="error">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Error while rendering the map</Alert.Title>
            <Alert.Description>{error.message}</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      </Box>
    </Flex>
  );
}
