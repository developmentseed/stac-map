import { useStore } from "@/store";
import { getPaddedViewportBbox } from "@/utils/map";
import { Button, ButtonGroup, HStack, IconButton } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { LuCheck, LuShare2 } from "react-icons/lu";
import { useMap } from "react-map-gl/maplibre";
import { useAuthEnabled } from "../contexts/auth-enabled";
import { useExamples } from "../contexts/examples";
import { Examples } from "./examples";
import HrefInput from "./href-input";
import { UserButton } from "./ui/auth";
import { ColorModeButton } from "./ui/color-mode";
import { ProjectionButton } from "./ui/projection";
import { SettingsButton } from "./ui/settings";

export default function Header() {
  const href = useStore((store) => store.href);
  const authEnabled = useAuthEnabled();
  const examples = useExamples();
  return (
    <HStack pointerEvents={"auto"}>
      <HrefInput />
      {href?.startsWith("http") && <ShareButton />}
      <ButtonGroup variant={"surface"} attached>
        {examples.length > 0 && (
          <Examples>
            <Button bg={"bg.muted/90"}>Examples</Button>
          </Examples>
        )}
        <ProjectionButton />
        <ColorModeButton />
        <SettingsButton />
        {authEnabled && <UserButton />}
      </ButtonGroup>
    </HStack>
  );
}

function ShareButton() {
  const { map } = useMap();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 3000);
    return () => clearTimeout(id);
  }, [copied]);

  async function copyShareUrl() {
    const url = new URL(window.location.href);
    if (map) url.searchParams.set("bbox", getPaddedViewportBbox(map).join(","));
    await navigator.clipboard.writeText(url.toString());
    setCopied(true);
  }

  return (
    <IconButton variant={"surface"} onClick={copyShareUrl}>
      {copied ? <LuCheck /> : <LuShare2 />}
    </IconButton>
  );
}
