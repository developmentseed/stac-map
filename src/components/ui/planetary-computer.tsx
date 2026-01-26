import { fetchPlanetaryComputerSignedHref } from "@/utils/planetary-computer";
import { IconButton } from "@chakra-ui/react";
import { useState } from "react";
import { LuDownload, LuLoader } from "react-icons/lu";

export function PlanetaryComputerDownload({ href }: { href: string }) {
  const [isSigning, setIsSigning] = useState(false);

  return (
    <IconButton
      onClick={async () => {
        setIsSigning(true);
        const signedHref = await fetchPlanetaryComputerSignedHref(href);
        window.open(signedHref || href, "_blank");
        setIsSigning(false);
      }}
      disabled={isSigning}
    >
      {isSigning ? <LuLoader /> : <LuDownload />}
    </IconButton>
  );
}
