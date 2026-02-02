import type { IconButtonProps } from "@chakra-ui/react";
import { IconButton } from "@chakra-ui/react";
import * as React from "react";
import { LuGlobe, LuMap } from "react-icons/lu";
import { useStore } from "../../store";

function ProjectionIcon() {
  const projection = useStore((store) => store.projection);
  return projection === "globe" ? <LuGlobe /> : <LuMap />;
}

interface ProjectionButtonProps extends Omit<IconButtonProps, "aria-label"> {}

export const ProjectionButton = React.forwardRef<
  HTMLButtonElement,
  ProjectionButtonProps
>(function ProjectionButton(props, ref) {
  const toggleProjection = useStore((store) => store.toggleProjection);
  return (
    <IconButton
      onClick={toggleProjection}
      variant="ghost"
      aria-label="Toggle projection"
      ref={ref}
      {...props}
    >
      <ProjectionIcon />
    </IconButton>
  );
});
