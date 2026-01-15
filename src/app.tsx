import { useEffect } from "react";
import { MapProvider } from "react-map-gl/maplibre";
import { Box, Container } from "@chakra-ui/react";
import Map from "./components/map";
import Overlay from "./components/overlay";
import { Toaster } from "./components/ui/toaster";
import { useStore } from "./store";
import { getCurrentHref } from "./utils/href";

export default function App() {
  const href = useStore((state) => state.href);
  const setHref = useStore((state) => state.setHref);

  useEffect(() => {
    if (href && getCurrentHref() != href) {
      history.pushState(null, "", "?href=" + href);
    } else if (href === "") {
      history.pushState(null, "", location.pathname);
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

  return (
    <MapProvider>
      <Box h={"100dvh"}>
        <Map />
      </Box>
      <Container
        zIndex={1}
        fluid
        h="100dvh"
        pointerEvents={"none"}
        position={"absolute"}
        top={0}
        left={0}
        pt={4}
      >
        <Overlay />
      </Container>
      <Toaster />
    </MapProvider>
  );
}
