import {
  AbsoluteCenter,
  Alert,
  Box,
  Center,
  FileUpload,
  HStack,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useDuckDb } from "duckdb-wasm-kit";
import { useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { LuGithub } from "react-icons/lu";
import Footer from "./components/footer";
import Map from "./components/map";
import Overlay from "./components/overlay";
import { useStore } from "./store";
import { getCurrentHref } from "./utils/href";
import { uploadFile } from "./utils/upload";

function MapFallback({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    <AbsoluteCenter h="100dvh%" w="100dvw">
      <Center maxW={"40%"}>
        <Alert.Root status="error">
          <Alert.Indicator />
          <Alert.Content gap={4}>
            <Alert.Title>
              <HStack>We're really sorry!</HStack>
            </Alert.Title>
            <Alert.Description>
              <Stack>
                <HStack>Something went wrong in the map component</HStack>
                <Text>The error message is "{message}"</Text>
                <Text>
                  Please{" "}
                  <Link href="https://github.com/developmentseed/stac-map/issues/new?template=bug_report.md">
                    open an issue <LuGithub />
                  </Link>{" "}
                  so we can fix it!
                </Text>
              </Stack>
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      </Center>
    </AbsoluteCenter>
  );
}

function OverlayFallback({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    <Box position="absolute" top={4} left={4}>
      <Alert.Root status="error">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>Overlay failed to load</Alert.Title>
          <Alert.Description>{message}</Alert.Description>
        </Alert.Content>
      </Alert.Root>
    </Box>
  );
}

export default function App() {
  const href = useStore((state) => state.href);
  const setHref = useStore((state) => state.setHref);
  const setUploadedFile = useStore((state) => state.setUploadedFile);
  const setConnection = useStore((state) => state.setConnection);
  const { db } = useDuckDb();

  useEffect(() => {
    if (href) {
      history.pushState(null, "", "?href=" + href);
      document.title = "stac-map | " + href;
    } else {
      history.pushState(null, "", location.pathname);
      document.title = "stac-map";
    }
  }, [href]);

  useEffect(() => {
    function handlePopState() {
      setHref(getCurrentHref() ?? "");
    }
    window.addEventListener("popstate", handlePopState);

    if (getCurrentHref()) {
      try {
        new URL(getCurrentHref());
      } catch {
        history.pushState(null, "", location.pathname);
      }
    }

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [setHref]);

  useEffect(() => {
    if (db) {
      (async () => {
        const connection = await db.connect();
        await connection.query("LOAD spatial;");
        await connection.query("LOAD icu;");
        setConnection(connection);
      })();
    }
  }, [db, setConnection]);

  return (
    <>
      <Box h={"100dvh"}>
        <FileUpload.Root
          unstyled={true}
          onFileAccept={(details) => {
            uploadFile({
              file: details.files[0],
              setUploadedFile,
              db,
            });
          }}
          disabled={!db}
        >
          <FileUpload.HiddenInput />
          <FileUpload.Dropzone
            disableClick={true}
            style={{
              height: "100dvh",
              width: "100dvw",
            }}
          >
            <ErrorBoundary FallbackComponent={MapFallback}>
              <Map />
            </ErrorBoundary>
          </FileUpload.Dropzone>
        </FileUpload.Root>
      </Box>
      <ErrorBoundary FallbackComponent={OverlayFallback}>
        <Overlay />
      </ErrorBoundary>
      <Footer />
    </>
  );
}
