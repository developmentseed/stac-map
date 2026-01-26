import { Image } from "@chakra-ui/react";
import type { StacAsset } from "stac-ts";

export default function Thumbnail({ asset }: { asset: StacAsset }) {
  return <Image src={asset.href} />;
}
