import { useStore } from "@/store";
import type { StacValue } from "@/types/stac";
import { getSelfHref, getStacValueTitle } from "@/utils/stac";
import { Link, List } from "@chakra-ui/react";

export default function ValueListItem({
  value,
  isHovered = false,
  onMouseEnter,
  onMouseLeave,
}: {
  value: StacValue;
  isHovered?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  const setHref = useStore((store) => store.setHref);
  const selfHref = getSelfHref(value);
  return (
    <List.Item
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      fontWeight={isHovered ? "bolder" : "normal"}
    >
      <Link
        href="#"
        onClick={(e) => {
          e.preventDefault();
          if (selfHref) setHref(selfHref);
        }}
      >
        {getStacValueTitle(value)}
      </Link>
    </List.Item>
  );
}
