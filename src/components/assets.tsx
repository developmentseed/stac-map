import { useEffect, useState } from "react";
import { LuDownload, LuFileImage } from "react-icons/lu";
import {
  Badge,
  ButtonGroup,
  Clipboard,
  Group,
  Heading,
  HStack,
  IconButton,
  RadioCard,
  Stack,
} from "@chakra-ui/react";
import type { StacAsset } from "stac-ts";
import { useStore } from "../store";

export default function Assets({
  assets,
}: {
  assets: { [k: string]: StacAsset };
}) {
  const setGeotiffHref = useStore((store) => store.setGeotiffHref);
  const [value, setValue] = useState<string | null>(
    Object.entries(assets).find(([, asset]) => isGeotiff(asset))?.[0] || null
  );

  useEffect(() => {
    if (value) {
      setGeotiffHref(assets[value]?.href);
    } else {
      setGeotiffHref(null);
    }
  }, [assets, value, setGeotiffHref]);

  return (
    <Stack>
      <Heading size={"md"}>
        <HStack>
          <LuFileImage /> Assets
        </HStack>
      </Heading>
      <RadioCard.Root
        value={value}
        onValueChange={(e) => setValue(e.value)}
        size={"sm"}
      >
        <Group orientation="vertical">
          {Object.entries(assets).map(([key, asset]) => (
            <Asset key={key} assetKey={key} asset={asset} />
          ))}
        </Group>
      </RadioCard.Root>
    </Stack>
  );
}

function Asset({ assetKey, asset }: { assetKey: string; asset: StacAsset }) {
  const scheme = asset.href.split(":").at(0);

  return (
    <RadioCard.Item
      value={assetKey}
      width={"full"}
      disabled={!isGeotiff(asset)}
    >
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
        <ButtonGroup size={"xs"} variant={"plain"}>
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
      </RadioCard.ItemAddon>
    </RadioCard.Item>
  );
}

function isGeotiff(asset: StacAsset) {
  return (
    asset.type?.startsWith("image/tiff; application=geotiff") &&
    asset.href.startsWith("http")
  );
}
