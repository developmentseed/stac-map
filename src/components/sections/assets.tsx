import { LuFiles } from "react-icons/lu";
import { DataList } from "@chakra-ui/react";
import type { StacAssets } from "../../types/stac";
import AssetCard from "../cards/asset";
import Section from "../section";

interface AssetsProps {
  assets: StacAssets;
  cogHref: string | undefined;
  setcogHref: (href: string | undefined) => void;
}

export default function AssetsSection({ ...props }: AssetsProps) {
  return (
    <Section title="Assets" TitleIcon={LuFiles} value="assets">
      <Assets {...props} />
    </Section>
  );
}

function Assets({ assets, cogHref, setcogHref }: AssetsProps) {
  return (
    <DataList.Root>
      {Object.keys(assets).map((key) => (
        <DataList.Item key={"asset-" + key}>
          <DataList.ItemLabel>{key}</DataList.ItemLabel>
          <DataList.ItemValue>
            <AssetCard
              asset={assets[key]}
              cogHref={cogHref}
              setcogHref={setcogHref}
            />
          </DataList.ItemValue>
        </DataList.Item>
      ))}
    </DataList.Root>
  );
}
