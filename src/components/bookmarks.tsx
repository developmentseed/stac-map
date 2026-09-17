import { IconButton, Menu, Portal, Span } from "@chakra-ui/react";
import { LuBookmark, LuBookmarkCheck, LuX } from "react-icons/lu";
import { useStore } from "../store";

const TOGGLE_VALUE = "__toggle__";

export function Bookmarks() {
  const href = useStore((store) => store.href);
  const bookmarks = useStore((store) => store.bookmarks);
  const addBookmark = useStore((store) => store.addBookmark);
  const removeBookmark = useStore((store) => store.removeBookmark);
  const setHref = useStore((store) => store.setHref);

  const isBookmarked = !!href && bookmarks.some((b) => b.href === href);

  function handleSelect(details: { value: string }) {
    if (details.value === TOGGLE_VALUE) {
      if (!href) return;
      if (isBookmarked) removeBookmark(href);
      else addBookmark(href);
    } else {
      setHref(details.value);
    }
  }

  return (
    <Menu.Root onSelect={handleSelect}>
      <Menu.Trigger asChild>
        <IconButton
          variant={"surface"}
          bg={"bg.muted/90"}
          aria-label={"Bookmarks"}
        >
          {isBookmarked ? <LuBookmarkCheck /> : <LuBookmark />}
        </IconButton>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            {href && (
              <Menu.Item value={TOGGLE_VALUE}>
                {isBookmarked ? "Remove bookmark" : "Bookmark this page"}
              </Menu.Item>
            )}
            {href && bookmarks.length > 0 && <Menu.Separator />}
            {bookmarks.map((bookmark) => (
              <Menu.Item key={bookmark.href} value={bookmark.href}>
                <Span truncate>{bookmark.href}</Span>
                <Span flex={1} />
                <IconButton
                  size={"2xs"}
                  variant={"ghost"}
                  aria-label={"Remove bookmark"}
                  onClick={(event) => {
                    event.stopPropagation();
                    removeBookmark(bookmark.href);
                  }}
                >
                  <LuX />
                </IconButton>
              </Menu.Item>
            ))}
            {bookmarks.length === 0 && !href && (
              <Menu.Item value={"__empty__"} disabled>
                No bookmarks yet
              </Menu.Item>
            )}
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}
