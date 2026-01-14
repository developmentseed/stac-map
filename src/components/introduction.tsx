import { Link, Stack } from "@chakra-ui/react";

export default function Introduction() {
  return (
    <Stack fontSize={"sm"} fontWeight={"lighter"}>
      <p>
        <strong>stac-map</strong> is a map-first visualization tool for{" "}
        <Link variant={"underline"} href="https://stacspec.org">
          STAC
        </Link>
        .
      </p>

      <p>
        Questions, issues, or feature requests? Get in touch on{" "}
        <Link asChild>
          <a href="https://github.com/developmentseed/stac-map" target="_blank">
            GitHub
          </a>
        </Link>
        .
      </p>
    </Stack>
  );
}
