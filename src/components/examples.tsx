import { Badge, Menu, Portal, Span } from "@chakra-ui/react";
import { useMemo, type ReactNode } from "react";
import { useExamples } from "../contexts/examples";
import { useStacGeoparquet } from "../contexts/stac-geoparquet";
import { useStore } from "../store";

export function Examples({ children }: { children: ReactNode }) {
  const setHref = useStore((store) => store.setHref);
  const examples = useExamples();
  const parquetCtx = useStacGeoparquet();
  const visibleExamples = useMemo(
    () =>
      parquetCtx
        ? examples
        : examples.filter((example) => example.badge !== "stac-geoparquet"),
    [examples, parquetCtx]
  );
  return (
    <Menu.Root onSelect={(details) => setHref(details.value)}>
      <Menu.Trigger asChild>{children}</Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            {visibleExamples.map(({ title, badge, href }, index) => (
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
