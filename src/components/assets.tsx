import { useEffect, useState } from "react";
import {
  LuChevronDown,
  LuCircle,
  LuCircleDot,
  LuDownload,
  LuFileImage,
} from "react-icons/lu";
import {
  Badge,
  Button,
  ButtonGroup,
  Clipboard,
  Group,
  IconButton,
  Menu,
  Portal,
  RadioCard,
  Table,
} from "@chakra-ui/react";
import type { StacAsset } from "stac-ts";
import { type ListOrCard, Section } from "./section";
import { useStore } from "../store";

interface AlternateAsset {
  href: string;
  title?: string;
}

interface Band {
  name?: string;
  common_name?: string;
  description?: string;
}

type AssetWithAlternates = StacAsset & {
  alternate?: { [key: string]: AlternateAsset };
  bands?: Band[];
  "eo:bands"?: Band[];
};

export default function Assets({
  assets,
}: {
  assets: { [k: string]: StacAsset };
}) {
  const setGeotiffHref = useStore((store) => store.setGeotiffHref);
  let defaultValue = null;
  for (const [key, asset] of Object.entries(assets)) {
    if (!defaultValue && isGeotiff(asset)) {
      defaultValue = key;
    }
    if (defaultValue && isGeotiff(asset) && asset.roles?.includes("visual")) {
      defaultValue = key;
    }
  }
  const [value, setValue] = useState<string | null>(defaultValue);

  useEffect(() => {
    if (value) {
      const asset = assets[value] as AssetWithAlternates | undefined;
      setGeotiffHref(asset ? getGeotiffHref(asset) : null);
    } else {
      setGeotiffHref(null);
    }
  }, [assets, value, setGeotiffHref]);

  return (
    <Section
      icon={<LuFileImage />}
      title="Assets"
      count={Object.keys(assets).length}
    >
      {(listOrCard) => (
        <AssetsList
          assets={assets}
          value={value}
          setValue={setValue}
          listOrCard={listOrCard}
        />
      )}
    </Section>
  );
}

function AssetsList({
  assets,
  value,
  setValue,
  listOrCard,
}: {
  assets: { [k: string]: StacAsset };
  value: string | null;
  setValue: (value: string | null) => void;
  listOrCard: ListOrCard;
}) {
  if (listOrCard === "list") {
    return (
      <Table.Root size="sm">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader />
            <Table.ColumnHeader>Key</Table.ColumnHeader>
            <Table.ColumnHeader>Type</Table.ColumnHeader>
            <Table.ColumnHeader />
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {Object.entries(assets).map(([key, asset]) => (
            <AssetRow
              key={key}
              assetKey={key}
              asset={asset}
              selected={value === key}
              onSelect={() => setValue(isGeotiff(asset) ? key : null)}
            />
          ))}
        </Table.Body>
      </Table.Root>
    );
  }

  return (
    <RadioCard.Root
      value={value}
      onValueChange={(e) => setValue(e.value)}
      size="sm"
    >
      <Group orientation="vertical">
        {Object.entries(assets).map(([key, asset]) => (
          <AssetCard key={key} assetKey={key} asset={asset} />
        ))}
      </Group>
    </RadioCard.Root>
  );
}

function AssetCard({
  assetKey,
  asset,
}: {
  assetKey: string;
  asset: AssetWithAlternates;
}) {
  const scheme = asset.href.split(":").at(0);
  const bandCount = getBandCount(asset);

  return (
    <RadioCard.Item value={assetKey} width="full" disabled={!isGeotiff(asset)}>
      <RadioCard.ItemHiddenInput />
      <RadioCard.ItemControl>
        <RadioCard.ItemContent>
          <RadioCard.ItemText>{asset.title || assetKey}</RadioCard.ItemText>
          <RadioCard.ItemDescription>
            <Badge>{scheme}</Badge>
            {bandCount !== null && (
              <Badge>
                {bandCount} band{bandCount === 1 ? "" : "s"}
              </Badge>
            )}
            {asset.type && <Badge>{asset.type}</Badge>}
          </RadioCard.ItemDescription>
        </RadioCard.ItemContent>
        <RadioCard.ItemIndicator />
      </RadioCard.ItemControl>
      <RadioCard.ItemAddon>
        <AssetActions asset={asset} scheme={scheme} />
      </RadioCard.ItemAddon>
    </RadioCard.Item>
  );
}

function AssetRow({
  assetKey,
  asset,
  selected,
  onSelect,
}: {
  assetKey: string;
  asset: AssetWithAlternates;
  selected: boolean;
  onSelect: () => void;
}) {
  const scheme = asset.href.split(":").at(0);
  const geotiff = isGeotiff(asset);
  const bandCount = getBandCount(asset);

  return (
    <Table.Row
      onClick={geotiff ? onSelect : undefined}
      cursor={geotiff ? "pointer" : "default"}
      bg={selected ? "bg.muted" : undefined}
    >
      <Table.Cell>
        {geotiff && (selected ? <LuCircleDot /> : <LuCircle />)}
      </Table.Cell>
      <Table.Cell>{asset.title || assetKey}</Table.Cell>
      <Table.Cell>
        <Badge>{asset.type || scheme}</Badge>
        {bandCount !== null && (
          <Badge ml={1}>
            {bandCount} band{bandCount === 1 ? "" : "s"}
          </Badge>
        )}
      </Table.Cell>
      <Table.Cell>
        <AssetActions asset={asset} scheme={scheme} />
      </Table.Cell>
    </Table.Row>
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
    <ButtonGroup size="xs" variant="plain">
      <Clipboard.Root value={asset.href}>
        <Clipboard.Trigger asChild>
          <IconButton>
            <Clipboard.Indicator />
          </IconButton>
        </Clipboard.Trigger>
      </Clipboard.Root>
      {scheme?.startsWith("http") && (
        <IconButton asChild>
          <a href={asset.href}>
            <LuDownload />
          </a>
        </IconButton>
      )}
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

function getBandCount(asset: AssetWithAlternates): number | null {
  const bands = asset.bands || asset["eo:bands"];
  return bands ? bands.length : null;
}

function hasValidBandCount(asset: AssetWithAlternates): boolean {
  const bandCount = getBandCount(asset);
  if (bandCount === null) {
    return true;
  }
  return bandCount === 3 || bandCount === 4;
}

function hasHttpHref(asset: AssetWithAlternates): boolean {
  if (asset.href.startsWith("http")) {
    return true;
  }
  if (asset.alternate) {
    return Object.values(asset.alternate).some((alt) =>
      alt.href.startsWith("http")
    );
  }
  return false;
}

function isGeotiff(asset: AssetWithAlternates) {
  if (!asset.type?.startsWith("image/tiff; application=geotiff")) {
    return false;
  }
  if (!hasValidBandCount(asset)) {
    return false;
  }
  return hasHttpHref(asset);
}

function getGeotiffHref(asset: AssetWithAlternates): string | null {
  if (!isGeotiff(asset)) {
    return null;
  }
  if (asset.href.startsWith("http")) {
    return asset.href;
  }
  if (asset.alternate) {
    const httpAlternate = Object.values(asset.alternate).find((alt) =>
      alt.href.startsWith("http")
    );
    if (httpAlternate) {
      return httpAlternate.href;
    }
  }
  return null;
}
