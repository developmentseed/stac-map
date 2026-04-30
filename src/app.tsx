import { AbsoluteCenter, Box, Center, FileUpload } from "@chakra-ui/react";
import { useDuckDb } from "duckdb-wasm-kit";
import { type ReactNode, useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import Map from "./components/map";
import Overlay from "./components/overlay";
import { ErrorBoundaryAlert } from "./components/ui/error-alert";
import { useStore } from "./store";
import { uploadFile } from "./utils/upload";

function MapFallback({ error }: { error: unknown }) {
  return (
    <AbsoluteCenter h="100dvh%" w="100dvw">
      <Center maxW={"40%"}>
        <ErrorBoundaryAlert context="map component" error={error} />
      </Center>
    </AbsoluteCenter>
  );
}

function OverlayFallback({ error }: { error: unknown }) {
  return (
    <Box position="absolute" top={4} left={4} maxW={"30%"}>
      <ErrorBoundaryAlert context="overlay" error={error} />
    </Box>
  );
}

export default function App({ footer }: { footer?: ReactNode }) {
  const setUploadedFile = useStore((state) => state.setUploadedFile);
  const setConnection = useStore((state) => state.setConnection);
  const { db } = useDuckDb();

  useEffect(() => {
    if (db) {
      (async () => {
        const connection = await db.connect();
        await connection.query("LOAD spatial;");
        await connection.query("LOAD icu;");
        await connection.query("LOAD httpfs;");
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
      {footer}
    </>
  );
}
