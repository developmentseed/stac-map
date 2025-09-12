import {
  type UseFileUploadReturn,
  Box,
  FileUpload,
  Link,
  Stack,
} from "@chakra-ui/react";
import { Examples } from "../examples";
import type { SetHref } from "../types/app";

export default function Introduction({
  fileUpload,
  setHref,
}: {
  fileUpload: UseFileUploadReturn;
  setHref: SetHref;
}) {
  return (
    <Stack fontSize={"sm"} fontWeight={"lighter"}>
      <Box>
        <strong>stac-map</strong> is a map-first, statically-served, single-page
        visualization tool for{" "}
        <Link variant={"underline"} href="https://stacspec.org">
          STAC
        </Link>{" "}
        catalogs, collections, and items. To get started, use the text input,{" "}
        <FileUpload.RootProvider
          value={fileUpload}
          as={"span"}
          display={"inline"}
        >
          <FileUpload.Trigger asChild>
            <Link>upload a file</Link>
          </FileUpload.Trigger>
        </FileUpload.RootProvider>
        , or load an{" "}
        <Examples setHref={setHref}>
          <Link>example</Link>
        </Examples>
        .
      </Box>
      <Box>
        Questions, issues, or feature requests? Get in touch on{" "}
        <Link asChild>
          <a href="https://github.com/developmentseed/stac-map" target="_blank">
            GitHub
          </a>
        </Link>
        .
      </Box>
    </Stack>
  );
}
