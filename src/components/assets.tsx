import type { StacAssets } from "@/types/stac";
import { getBandCount } from "@/utils/stac";
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
import { LuDownload, LuFileArchive } from "react-icons/lu";
import type { StacAsset } from "stac-ts";
import Section from "./ui/section";

export default function Assets({ assets }: { assets: StacAssets }) {
  return (
    <Section icon={<LuFileArchive />} title="Assets">
      <Stack>
        {Object.entries(assets).map(([key, asset]) => (
          <AssetCard key={key} assetKey={key} asset={asset} />
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
  const scheme = asset.href.split(":").at(0);
  const bandCount = getBandCount(asset);
  const alternate = (
    asset as {
      alternate?: Record<string, { href: string; title?: string }>;
    }
  ).alternate;

  return (
    <Card.Root size={"sm"} variant={"outline"}>
      <Card.Body gap={4}>
        <Card.Title>
          {asset.title || assetKey}
          {bandCount !== undefined && (
            <Card.Description as={"span"} ms={2}>
              {bandCount} band{bandCount === 1 ? "" : "s"}
            </Card.Description>
          )}
        </Card.Title>
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
