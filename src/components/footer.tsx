import { HStack, Link } from "@chakra-ui/react";
import { CollecticonBrandDevelopmentSeed2 } from "@devseed-ui/collecticons-chakra";
import { LuHeart } from "react-icons/lu";
import { version } from "../../package.json";

export default function Footer() {
  return (
    <HStack
      position={"absolute"}
      bottom={4}
      left={8}
      fontWeight={"lighter"}
      fontSize={"small"}
    >
      v{version} | Crafted with <LuHeart /> by{" "}
      <Link href="https://developmentseed.org/">
        Development Seed <CollecticonBrandDevelopmentSeed2 />
      </Link>
    </HStack>
  );
}
