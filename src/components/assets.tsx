import { useStore } from "@/store";
import type { StacAssets } from "@/types/stac";
import { getBandCount, getCogHref } from "@/utils/stac";
import {
  Badge,
  Button,
  ButtonGroup,
  Card,
  Clipboard,
  HStack,
  IconButton,
  Stack,
} from "@chakra-ui/react";
import { COGLayer } from "@developmentseed/deck.gl-geotiff";
import { useEffect, useState } from "react";
import { LuDownload, LuEye, LuEyeOff, LuFileArchive } from "react-icons/lu";
import type { StacAsset } from "stac-ts";
import Section from "./ui/section";

export default function Assets({ assets }: { assets: StacAssets }) {
  const [selectedKey, setSelectedKey] = useState(() => pickBestKey(assets));
  const [lastAssets, setLastAssets] = useState(assets);
  if (lastAssets !== assets) {
    setLastAssets(assets);
    setSelectedKey(pickBestKey(assets));
  }
  return (
    <Section icon={<LuFileArchive />} title="Assets">
      <Stack>
        {Object.entries(assets).map(([key, asset]) => (
          <AssetCard
            key={key}
            assetKey={key}
            asset={asset}
            selected={selectedKey === key}
            onToggle={() =>
              setSelectedKey(selectedKey === key ? undefined : key)
            }
          />
        ))}
      </Stack>
    </Section>
  );
}

function AssetCard({
  assetKey,
  asset,
  selected,
  onToggle,
}: {
  assetKey: string;
  asset: StacAsset;
  selected: boolean;
  onToggle: () => void;
}) {
  const setLayer = useStore((store) => store.setLayer);
  const scheme = asset.href.split(":").at(0);
  const cogHref = getCogHref(asset);
  const bandCount = getBandCount(asset);
  const alternate = (
    asset as {
      alternate?: Record<string, { href: string; title?: string }>;
    }
  ).alternate;

  useEffect(() => {
    if (!cogHref || !selected) return;
    const layerId = `cog-asset-${assetKey}`;
    setLayer(
      layerId,
      new COGLayer({
        id: layerId,
        geotiff: cogHref,
      })
    );
    return () => setLayer(layerId, undefined);
  }, [cogHref, assetKey, setLayer, selected]);

  return (
    <Card.Root size={"sm"} variant={"outline"}>
      <Card.Body gap={4}>
        <HStack justify={"space-between"}>
          <Card.Title>
            {asset.title || assetKey}
            {bandCount !== undefined && (
              <Card.Description as={"span"} ms={2}>
                {bandCount} band{bandCount === 1 ? "" : "s"}
              </Card.Description>
            )}
          </Card.Title>
          {cogHref && (
            <IconButton
              size={"xs"}
              variant={"ghost"}
              aria-label={
                selected ? "Disable visualization" : "Enable visualization"
              }
              onClick={onToggle}
            >
              {selected ? <LuEye /> : <LuEyeOff />}
            </IconButton>
          )}
        </HStack>
        <Card.Description>
          {Array.isArray(asset.roles) &&
            asset.roles.map((role) => <Badge key={role}>{role}</Badge>)}
          {asset.type && <Badge>{asset.type}</Badge>}
        </Card.Description>
        <Card.Footer>
          <HStack wrap={"wrap"} gap={2}>
            <HrefButtons label={scheme ?? "href"} href={asset.href} />
            {alternate &&
              Object.entries(alternate).map(([altKey, alt]) => (
                <HrefButtons key={altKey} label={altKey} href={alt.href} />
              ))}
          </HStack>
        </Card.Footer>
      </Card.Body>
    </Card.Root>
  );
}

function HrefButtons({ label, href }: { label: string; href: string }) {
  const isHttp = /^https?:/i.test(href);
  return (
    <ButtonGroup size={"2xs"} variant={"surface"} attached>
      <Clipboard.Root value={href}>
        <Clipboard.Trigger asChild>
          <Button>
            <Clipboard.Indicator />
            &nbsp;{label}
          </Button>
        </Clipboard.Trigger>
      </Clipboard.Root>
      {isHttp && (
        <IconButton asChild aria-label={`Download ${label}`}>
          <a href={href} download target={"_blank"} rel={"noreferrer"}>
            <LuDownload />
          </a>
        </IconButton>
      )}
    </ButtonGroup>
  );
}

function pickBestKey(assets: StacAssets): string | undefined {
  const displayable = Object.entries(assets).filter(([, asset]) =>
    getCogHref(asset)
  );
  if (displayable.length === 0) return undefined;
  const score = ([key, asset]: [string, StacAsset]) =>
    (key === "visual" ? 2 : 0) + (asset.roles?.includes("visual") ? 1 : 0);
  return displayable.reduce((best, current) =>
    score(current) > score(best) ? current : best
  )[0];
}
