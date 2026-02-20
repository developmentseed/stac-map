import { Prose } from "@/components/ui/prose";
import { CloseButton, Dialog, HStack, Link, Portal } from "@chakra-ui/react";
import { CollecticonBrandDevelopmentSeed2 } from "@devseed-ui/collecticons-chakra";
import { LuGithub, LuHeart } from "react-icons/lu";
import Markdown from "react-markdown";
import changelog from "../../CHANGELOG.md?raw";
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
      <Dialog.Root size={"xl"} scrollBehavior={"inside"}>
        <Dialog.Trigger asChild>
          <Link as={"button"}>v{version}</Link>
        </Dialog.Trigger>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title fontSize={"sm"}>
                  stac-map is public, open source, and free. Found a bug or have
                  a feature request?{" "}
                  <Link
                    href="https://github.com/developmentseed/stac-map/issues/new/choose"
                    target="_blank"
                  >
                    Open an issue on Github <LuGithub />
                  </Link>
                </Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Prose>
                  <Markdown>{changelog}</Markdown>
                </Prose>
              </Dialog.Body>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>{" "}
      | Crafted with <LuHeart /> by{" "}
      <Link href="https://developmentseed.org/">
        Development Seed <CollecticonBrandDevelopmentSeed2 />
      </Link>
    </HStack>
  );
}
