import { Center, Image, Skeleton } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import type { StacAsset } from "stac-ts";

export default function Thumbnail({ asset }: { asset: StacAsset }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
  }, [asset.href]);

  return (
    <>
      {loading && (
        <Center>
          <Skeleton h="200px" w="75%" borderRadius={4} />
        </Center>
      )}
      <Image
        maxH={"200px"}
        fit={"scale-down"}
        src={asset.href}
        onLoad={() => setLoading(false)}
        onError={() => setLoading(false)}
        width="100%"
        borderRadius={4}
        display={loading ? "none" : "auto"}
      />
    </>
  );
}
