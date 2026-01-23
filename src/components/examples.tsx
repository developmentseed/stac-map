import { Badge, Menu, Portal, Span } from "@chakra-ui/react";
import { type ReactNode } from "react";
import { EXAMPLES } from "../constants";
import { useStore } from "../store";

export function Examples({ children }: { children: ReactNode }) {
  const setHref = useStore((store) => store.setHref);
  return (
    <Menu.Root onSelect={(details) => setHref(details.value)}>
      <Menu.Trigger asChild>{children}</Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            {EXAMPLES.map(({ title, badge, href }, index) => (
              <Menu.Item key={"example-" + index} value={href}>
                {title}
                <Span flex={1}></Span>
                <Badge>{badge}</Badge>
              </Menu.Item>
            ))}
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}
