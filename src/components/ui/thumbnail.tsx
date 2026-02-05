import { usePlanetaryComputerToken } from "@/hooks/planetary-computer";
import type { AzureBlobStorageContainer } from "@/types/planetary-computer";
import {
  parsePlanetaryComputerContainer,
  signPlanetaryComputerHref,
} from "@/utils/planetary-computer";
import { Center, Image } from "@chakra-ui/react";
import { useMemo } from "react";
import type { StacAsset } from "stac-ts";

export default function Thumbnail({ asset }: { asset: StacAsset }) {
  const planetaryComputerContainer = parsePlanetaryComputerContainer(
    asset.href
  );
  if (planetaryComputerContainer)
    return (
      <PlanetaryComputerThumbnail
        href={asset.href}
        container={planetaryComputerContainer}
      />
    );
  else return <HrefThumbnail href={asset.href} />;
}

function PlanetaryComputerThumbnail({
  href,
  container,
}: {
  href: string;
  container: AzureBlobStorageContainer;
}) {
  const { data: token } = usePlanetaryComputerToken({ container });
  const signedHref = useMemo(() => {
    if (token) return signPlanetaryComputerHref(href, token);
  }, [token, href]);
  if (signedHref) return <HrefThumbnail href={signedHref} />;
}

function HrefThumbnail({ href }: { href: string }) {
  return (
    <Center>
      <Image src={href} maxH={"250px"} />
    </Center>
  );
}
