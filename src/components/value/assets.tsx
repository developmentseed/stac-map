import { useStore } from "@/store";
import type { AssetWithAlternates } from "@/types/stac";
import { isPlanetaryComputerHref } from "@/utils/planetary-computer";
import { getBandCount, isGeotiff } from "@/utils/stac";
import {
  Badge,
  Box,
  Button,
  ButtonGroup,
  Card,
  Clipboard,
  HStack,
  IconButton,
  List,
  Menu,
  Portal,
  Span,
  Stack,
} from "@chakra-ui/react";
import { useEffect, useMemo } from "react";
import {
  LuChevronDown,
  LuDownload,
  LuEye,
  LuEyeClosed,
  LuEyeOff,
  LuFileImage,
} from "react-icons/lu";
import type { StacAsset } from "stac-ts";
import { Section } from "../section";
import { PlanetaryComputerDownload } from "../ui/planetary-computer";

interface StacAssets {
  [k: string]: StacAsset;
}

type SortedAssets = [string, StacAsset][];

export default function Assets({ assets }: { assets: StacAssets }) {
  const setAsset = useStore((store) => store.setAsset);
  const sortedAssets = useMemo(() => {
    return Object.entries(assets).sort(
      ([, a], [, b]) =>
        getAssetScore(b as AssetWithAlternates) -
        getAssetScore(a as AssetWithAlternates)
    );
  }, [assets]);
  const [bestAssetKey, bestAsset] = useMemo(() => {
    const first = sortedAssets[0];
    if (first && getAssetScore(first[1] as AssetWithAlternates) > 0) {
      return [first[0], first[1]];
    }
    return [null, null];
  }, [sortedAssets]);

  useEffect(() => {
    if (bestAssetKey) setAsset(bestAssetKey, bestAsset);
  }, [bestAssetKey, bestAsset, setAsset]);

  return (
    <Section icon={<LuFileImage />} title="Assets">
      {(listOrCard) =>
        listOrCard === "list" ? (
          <AssetsList assets={sortedAssets} />
        ) : (
          <AssetCards assets={sortedAssets} />
        )
      }
    </Section>
  );
}

function AssetsList({ assets }: { assets: SortedAssets }) {
  return (
    <List.Root variant={"plain"}>
      {assets.map(([key, asset]) => (
        <AssetListItem key={key} assetKey={key} asset={asset} />
      ))}
    </List.Root>
  );
}

function AssetListItem({
  assetKey,
  asset,
}: {
  assetKey: string;
  asset: StacAsset;
}) {
  const scheme = asset.href.split(":").at(0);
  return (
    <List.Item display={"block"}>
      <HStack>
        {asset.title || assetKey}
        <Span flex={1} />
        <AssetActions asset={asset} scheme={scheme} />
        <AssetVisibility asset={asset} assetKey={assetKey} />
      </HStack>
    </List.Item>
  );
}

function AssetCards({ assets }: { assets: SortedAssets }) {
  return (
    <Stack>
      {assets.map(([key, asset]) => (
        <AssetCard key={key} assetKey={key} asset={asset} />
      ))}
    </Stack>
  );
}

function AssetCard({
  assetKey,
  asset,
}: {
  assetKey: string;
  asset: StacAsset;
}) {
  const scheme = asset.href.split(":").at(0);

  return (
    <Card.Root size={"sm"} variant={"subtle"}>
      <Card.Body gap={4}>
        <Card.Title>{asset.title || assetKey}</Card.Title>
        <Box>
          {scheme && <Badge>{scheme}</Badge>}
          {asset.roles?.map((role) => (
            <Badge key={role}>{role}</Badge>
          ))}
          {asset.type && <Badge>{asset.type}</Badge>}
        </Box>
      </Card.Body>
      <Card.Footer>
        <AssetActions asset={asset} scheme={scheme} />
        <Span flex={1} />
        <AssetVisibility assetKey={assetKey} asset={asset} />
      </Card.Footer>
    </Card.Root>
  );
}

function AssetActions({
  asset,
  scheme,
}: {
  asset: AssetWithAlternates;
  scheme: string | undefined;
}) {
  const alternates = asset.alternate ? Object.entries(asset.alternate) : [];

  return (
    <ButtonGroup size="xs" variant="plain" attached>
      <Clipboard.Root value={asset.href}>
        <Clipboard.Trigger asChild>
          <IconButton>
            <Clipboard.Indicator />
          </IconButton>
        </Clipboard.Trigger>
      </Clipboard.Root>
      {scheme?.startsWith("http") &&
        (isPlanetaryComputerHref(asset.href) ? (
          <PlanetaryComputerDownload href={asset.href} />
        ) : (
          <IconButton asChild>
            <a href={asset.href}>
              <LuDownload />
            </a>
          </IconButton>
        ))}
      {alternates.length > 0 && (
        <Menu.Root>
          <Menu.Trigger asChild>
            <Button size="xs" variant="plain">
              Alternates
              <LuChevronDown />
            </Button>
          </Menu.Trigger>
          <Portal>
            <Menu.Positioner>
              <Menu.Content>
                {alternates.map(([key, alternate]) => {
                  const altScheme = alternate.href.split(":").at(0);
                  return (
                    <Menu.Item key={key} value={key} asChild>
                      <a
                        href={alternate.href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {alternate.title || key}
                        {altScheme && <Badge ml={2}>{altScheme}</Badge>}
                      </a>
                    </Menu.Item>
                  );
                })}
              </Menu.Content>
            </Menu.Positioner>
          </Portal>
        </Menu.Root>
      )}
    </ButtonGroup>
  );
}

function getAssetScore(asset: AssetWithAlternates): number {
  const geotiff = isGeotiff(asset);
  const hasVisualRole = asset.roles?.includes("visual") ?? false;
  const bandCount = getBandCount(asset);
  const hasThreeOrFourBands = bandCount === 3 || bandCount === 4;

  if (!geotiff && !hasVisualRole && !hasThreeOrFourBands) {
    return 0;
  }

  let score = 0;
  if (geotiff) score += 1;
  if (hasVisualRole) score += 2;
  if (hasThreeOrFourBands) score += 1;

  return score;
}

function AssetVisibility({
  asset,
  assetKey,
}: {
  asset: StacAsset;
  assetKey: string;
}) {
  const storeAssetKey = useStore((store) => store.assetKey);
  const setAsset = useStore((store) => store.setAsset);
  const isVisible = storeAssetKey === assetKey;
  const score = useMemo(() => {
    return getAssetScore(asset);
  }, [asset]);

  return (
    <IconButton
      size={"xs"}
      variant={"plain"}
      disabled={score === 0}
      onClick={() => {
        if (isVisible) setAsset(null, null);
        else setAsset(assetKey, asset);
      }}
    >
      {score === 0 ? <LuEyeOff /> : isVisible ? <LuEye /> : <LuEyeClosed />}
    </IconButton>
  );
}
