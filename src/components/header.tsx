import { Button, HStack } from "@chakra-ui/react";
import { Examples } from "./examples";
import HrefInput from "./href-input";
import { authConfig, UserButton } from "./ui/auth";
import { ColorModeButton } from "./ui/color-mode";
import { ProjectionButton } from "./ui/projection";
import { SettingsButton } from "./ui/settings";

export default function Header() {
  return (
    <HStack pointerEvents={"auto"}>
      <HrefInput />
      <Examples>
        <Button bg={"bg.muted/90"} variant={"outline"}>
          Examples
        </Button>
      </Examples>
      <ProjectionButton variant={"surface"} />
      <ColorModeButton variant={"surface"} />
      <SettingsButton variant={"surface"} />
      {authConfig && <UserButton variant={"surface"} />}
    </HStack>
  );
}
