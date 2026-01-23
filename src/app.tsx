import { Box, Container, FileUpload, HStack, Link } from "@chakra-ui/react";
import { CollecticonBrandDevelopmentSeed2 } from "@devseed-ui/collecticons-chakra";
import { useDuckDb } from "duckdb-wasm-kit";
import { useEffect } from "react";
import { LuHeart } from "react-icons/lu";
import Map from "./components/map";
import Overlay from "./components/overlay";
import { useStore } from "./store";
import { getCurrentHref } from "./utils/href";
import { uploadFile } from "./utils/upload";

export default function App() {
  const href = useStore((state) => state.href);
  const setHref = useStore((state) => state.setHref);
  const setUploadedFile = useStore((state) => state.setUploadedFile);
  const setConnection = useStore((state) => state.setConnection);
  const { db } = useDuckDb();

  useEffect(() => {
    if (href && getCurrentHref() != href)
      history.pushState(null, "", "?href=" + href);
    else history.pushState(null, "", location.pathname);
    document.title = "stac-map";
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
            <Map />
          </FileUpload.Dropzone>
        </FileUpload.Root>
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
      <HStack
        position={"absolute"}
        bottom={4}
        left={8}
        fontWeight={"lighter"}
        fontSize={"small"}
      >
        Created with <LuHeart /> by{" "}
        <Link href="https://developmentseed.org/">
          Development Seed <CollecticonBrandDevelopmentSeed2 />
        </Link>
      </HStack>
    </>
  );
}
