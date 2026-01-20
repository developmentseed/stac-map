import { useEffect, useState } from "react";
import { LuCircle, LuCircleDot, LuDownload, LuFileImage } from "react-icons/lu";
import {
  Badge,
  ButtonGroup,
  Clipboard,
  Group,
  IconButton,
  RadioCard,
  Table,
} from "@chakra-ui/react";
import type { StacAsset } from "stac-ts";
import { type ListOrCard, Section } from "./section";
import { useBoundStore } from "../store";

export default function Assets({
  assets,
}: {
  assets: { [k: string]: StacAsset };
}) {
  const setGeotiffHref = useBoundStore((store) => store.setGeotiffHref);
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
      setGeotiffHref(assets[value]?.href);
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
  asset: StacAsset;
}) {
  const scheme = asset.href.split(":").at(0);

  return (
    <RadioCard.Item value={assetKey} width="full" disabled={!isGeotiff(asset)}>
      <RadioCard.ItemHiddenInput />
      <RadioCard.ItemControl>
        <RadioCard.ItemContent>
          <RadioCard.ItemText>{asset.title || assetKey}</RadioCard.ItemText>
          <RadioCard.ItemDescription>
            <Badge>{scheme}</Badge>
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
  asset: StacAsset;
  selected: boolean;
  onSelect: () => void;
}) {
  const scheme = asset.href.split(":").at(0);
  const geotiff = isGeotiff(asset);

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
  asset: StacAsset;
  scheme: string | undefined;
}) {
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
    </ButtonGroup>
  );
}

function isGeotiff(asset: StacAsset) {
  return (
    asset.type?.startsWith("image/tiff; application=geotiff") &&
    asset.href.startsWith("http")
  );
}
