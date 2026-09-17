import { useStore } from "@/store";
import { clampToGlobalExtents, roundBbox } from "@/utils/bbox";
import { toStacDatetimeRange } from "@/utils/datetime";
import { getPaddedViewportBbox } from "@/utils/map";
import { Button, ButtonGroup, HStack, IconButton } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { LuCheck, LuShare2 } from "react-icons/lu";
import { useMap } from "react-map-gl/maplibre";
import { useAuthEnabled } from "../contexts/auth-enabled";
import { useExamples } from "../contexts/examples";
import { Bookmarks } from "./bookmarks";
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
      {examples.length > 0 && (
        <Examples>
          <Button bg={"bg.muted/90"} variant={"surface"}>
            Examples
          </Button>
        </Examples>
      )}
      <Bookmarks />
      <ButtonGroup variant={"surface"} attached>
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
  const visualization = useStore((store) => store.visualization);
  const activeSearchHref = useStore((store) => store.activeSearchHref);
  const searchParamsByHref = useStore((store) => store.searchParams);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 3000);
    return () => clearTimeout(id);
  }, [copied]);

  async function copyShareUrl() {
    const url = new URL(window.location.href);
    const searchParams = activeSearchHref
      ? searchParamsByHref[activeSearchHref]
      : undefined;
    const bbox = searchParams?.bbox ?? (map && getPaddedViewportBbox(map));
    if (bbox)
      url.searchParams.set(
        "bbox",
        roundBbox(clampToGlobalExtents(bbox)).join(",")
      );
    const datetimeRange =
      searchParams &&
      toStacDatetimeRange(searchParams.startDatetime, searchParams.endDatetime);
    if (datetimeRange) url.searchParams.set("datetime", datetimeRange);
    if (searchParams?.limit) url.searchParams.set("limit", searchParams.limit);
    if (searchParams?.queryables && Object.keys(searchParams.queryables).length)
      url.searchParams.set(
        "queryables",
        JSON.stringify(searchParams.queryables)
      );
    if (visualization) url.searchParams.set("viz", visualization);
    await navigator.clipboard.writeText(url.toString());
    setCopied(true);
  }

  return (
    <IconButton variant={"surface"} bg={"bg.muted/90"} onClick={copyShareUrl}>
      {copied ? <LuCheck /> : <LuShare2 />}
    </IconButton>
  );
}
