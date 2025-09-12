import {
  Alert,
  Box,
  Container,
  FileUpload,
  Flex,
  GridItem,
  SimpleGrid,
  useBreakpointValue,
  useFileUpload,
} from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { MapProvider } from "react-map-gl/dist/esm/exports-maplibre";
import Header from "./components/header";
import Map from "./components/map";
import Panel from "./components/panel";
import { Toaster } from "./components/ui/toaster";
import { StacMapProvider } from "./provider";

export default function App() {
  const [href, setHref] = useState<string | undefined>(getInitialHref());
  const fileUpload = useFileUpload({ maxFiles: 1 });
  const queryClient = new QueryClient({});
  const isHeaderAboveMap = useBreakpointValue({ base: true, md: false });

  useEffect(() => {
    function handlePopState() {
      setHref(new URLSearchParams(location.search).get("href") ?? "");
    }

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    if (href && new URLSearchParams(location.search).get("href") != href) {
      history.pushState(null, "", "?href=" + href);
    }
  }, [href]);

  useEffect(() => {
    // It should never be more than 1.
    if (fileUpload.acceptedFiles.length == 1) {
      setHref(fileUpload.acceptedFiles[0].name);
    }
  }, [fileUpload.acceptedFiles]);

  const header = (
    <Header href={href} setHref={setHref} fileUpload={fileUpload}></Header>
  );

  return (
    <QueryClientProvider client={queryClient}>
      <MapProvider>
        <StacMapProvider
          href={href}
          fileUpload={fileUpload}
          temporalFilter={undefined} // TODO re-add temporal filtering: https://github.com/developmentseed/stac-map/issues/123
        >
          <Box zIndex={0} position={"absolute"} top={0} left={0}>
            <FileUpload.RootProvider value={fileUpload} unstyled={true}>
              <FileUpload.Dropzone
                disableClick={true}
                style={{
                  height: "100dvh",
                  width: "100dvw",
                }}
              >
                <ErrorBoundary FallbackComponent={MapFallback}>
                  <Map></Map>
                </ErrorBoundary>
              </FileUpload.Dropzone>
            </FileUpload.RootProvider>
          </Box>
          <Container zIndex={1} fluid h={"dvh"} py={4} pointerEvents={"none"}>
            <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
              {isHeaderAboveMap && <GridItem colSpan={1}>{header}</GridItem>}
              <GridItem colSpan={1}>
                <Panel
                  href={href}
                  setHref={setHref}
                  fileUpload={fileUpload}
                ></Panel>
              </GridItem>
              {!isHeaderAboveMap && (
                <GridItem colSpan={2} hideBelow={"md"}>
                  {header}
                </GridItem>
              )}
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

function getInitialHref() {
  const href = new URLSearchParams(location.search).get("href") || "";
  try {
    new URL(href);
  } catch {
    return undefined;
  }
  return href;
}
