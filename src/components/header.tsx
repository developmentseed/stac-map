import { Button, ButtonGroup, HStack } from "@chakra-ui/react";
import { useAuthEnabled } from "../contexts/auth-enabled";
import { useExamples } from "../contexts/examples";
import { Examples } from "./examples";
import HrefInput from "./href-input";
import { UserButton } from "./ui/auth";
import { ColorModeButton } from "./ui/color-mode";
import { ProjectionButton } from "./ui/projection";

export default function Header() {
  const authEnabled = useAuthEnabled();
  const examples = useExamples();
  return (
    <HStack pointerEvents={"auto"}>
      <HrefInput />
      <ButtonGroup variant={"surface"} attached>
        {examples.length > 0 && (
          <Examples>
            <Button bg={"bg.muted/90"}>Examples</Button>
          </Examples>
        )}
        <ProjectionButton />
        <ColorModeButton />
        {authEnabled && <UserButton />}
      </ButtonGroup>
    </HStack>
  );
}
