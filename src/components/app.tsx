import { AbsoluteCenter, Box, Center, FileUpload } from "@chakra-ui/react";
import { useDuckDb } from "duckdb-wasm-kit";
import { type ReactNode, useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useStore } from "../store";
import { warmStacWasm } from "../utils/stac-wasm";
import { uploadFile } from "../utils/upload";
import Map from "./map";
import Overlay from "./overlay";
import type { ExtraLayerProps } from "./stac-map";
import { ErrorBoundaryAlert } from "./ui/error-alert";

function MapFallback({ error }: { error: unknown }) {
  return (
    <AbsoluteCenter h="100%" w="100%">
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

export default function App({
  footer,
  extraLayers,
}: {
  footer?: ReactNode;
  extraLayers?: ExtraLayerProps[];
}) {
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

  useEffect(() => {
    warmStacWasm();
  }, []);

  return (
    <>
      <Box h={"100%"} w={"100%"}>
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
          h={"100%"}
          w={"100%"}
        >
          <FileUpload.HiddenInput />
          <FileUpload.Dropzone disableClick={true} h={"100%"} w={"100%"}>
            <ErrorBoundary FallbackComponent={MapFallback}>
              <Map extraLayers={extraLayers} />
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
