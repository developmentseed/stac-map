import { useStore } from "@/store";
import type { StacAssets } from "@/types/stac";
import { Badge, Box, Card, HStack, IconButton, Stack } from "@chakra-ui/react";
import { COGLayer } from "@developmentseed/deck.gl-geotiff";
import { useEffect, useState } from "react";
import { LuEye, LuEyeOff, LuFileArchive } from "react-icons/lu";
import type { StacAsset } from "stac-ts";
import Section from "./ui/section";

export default function Assets({ assets }: { assets: StacAssets }) {
  return (
    <Section icon={<LuFileArchive />} title="Assets">
      <Stack>
        {Object.entries(assets).map((entry) => (
          <AssetCard key={entry[0]} assetKey={entry[0]} asset={entry[1]} />
        ))}
      </Stack>
    </Section>
  );
}

function AssetCard({
  assetKey,
  asset,
}: {
  assetKey: string;
  asset: StacAsset;
}) {
  const setLayer = useStore((store) => store.setLayer);
  const scheme = asset.href.split(":").at(0);
  const cogHref = getCogHref(asset);
  const [visualized, setVisualized] = useState(true);

  useEffect(() => {
    if (!cogHref || !visualized) return;
    const layerId = `cog-asset-${assetKey}`;
    setLayer(
      layerId,
      new COGLayer({
        id: layerId,
        geotiff: cogHref,
      })
    );
    return () => setLayer(layerId, undefined);
  }, [cogHref, assetKey, setLayer, visualized]);

  return (
    <Card.Root size={"sm"} variant={"outline"}>
      <Card.Body gap={4}>
        <HStack justify={"space-between"}>
          <Card.Title>{asset.title || assetKey}</Card.Title>
          {cogHref && (
            <IconButton
              size={"xs"}
              variant={"ghost"}
              aria-label={
                visualized ? "Disable visualization" : "Enable visualization"
              }
              onClick={() => setVisualized((v) => !v)}
            >
              {visualized ? <LuEye /> : <LuEyeOff />}
            </IconButton>
          )}
        </HStack>
        <Box>
          {scheme && <Badge>{scheme}</Badge>}
          {asset.roles?.map((role) => (
            <Badge key={role}>{role}</Badge>
          ))}
          {asset.type && <Badge>{asset.type}</Badge>}
        </Box>
      </Card.Body>
    </Card.Root>
  );
}

function getCogHref(asset: StacAsset): string | undefined {
  if (!asset.type?.startsWith("image/tiff; application=geotiff"))
    return undefined;
  const extra = asset as {
    "eo:bands"?: unknown[];
    bands?: unknown[];
    alternate?: Record<string, { href?: string }>;
  };
  for (const bands of [extra["eo:bands"], extra.bands]) {
    if (bands && bands.length !== 3 && bands.length !== 4) return undefined;
  }
  if (asset.href.startsWith("http")) return asset.href;
  if (extra.alternate) {
    for (const alt of Object.values(extra.alternate)) {
      if (alt.href?.startsWith("http")) return alt.href;
    }
  }
  return undefined;
}
