import { Center, Image } from "@chakra-ui/react";
import type { StacAsset } from "stac-ts";

export default function Thumbnail({ asset }: { asset: StacAsset }) {
  return (
    <Center>
      <Image src={asset.href} maxH={"250px"} />
    </Center>
  );
}
