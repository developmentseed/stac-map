import { AbsoluteCenter, Box, Center, FileUpload } from "@chakra-ui/react";
import { lazy, Suspense, type ReactNode } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useStacGeoparquet } from "../contexts/stac-geoparquet";
import { useStore } from "../store";
import { uploadFile } from "../utils/upload";
import Map from "./map";
import Overlay from "./overlay";
import type { ExtraLayerProps } from "./stac-map";
import { ErrorBoundaryAlert } from "./ui/error-alert";

const StacGeoparquetFeature =
  import.meta.env.VITE_STAC_GEOPARQUET === "false"
    ? null
    : lazy(() => import("./stac-geoparquet"));

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

function AppContents({ extraLayers }: { extraLayers?: ExtraLayerProps[] }) {
  const setUploadedFile = useStore((state) => state.setUploadedFile);
  const parquetCtx = useStacGeoparquet();
  return (
    <Box h={"100%"} w={"100%"}>
      <FileUpload.Root
        unstyled={true}
        onFileAccept={(details) => {
          void uploadFile({
            file: details.files[0],
            setUploadedFile,
            registerParquet: parquetCtx?.registerParquet,
          });
        }}
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
  );
}

export default function App({
  footer,
  extraLayers,
}: {
  footer?: ReactNode;
  extraLayers?: ExtraLayerProps[];
}) {
  const inner = (
    <>
      <AppContents extraLayers={extraLayers} />
      <ErrorBoundary FallbackComponent={OverlayFallback}>
        <Overlay />
      </ErrorBoundary>
      {footer}
    </>
  );

  if (StacGeoparquetFeature) {
    return (
      <Suspense fallback={inner}>
        <StacGeoparquetFeature>{inner}</StacGeoparquetFeature>
      </Suspense>
    );
  }
  return inner;
}
