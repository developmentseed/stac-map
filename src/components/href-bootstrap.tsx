import { useEffect } from "react";
import { useStore } from "../store";
import { isUrl, resolveInitialHref } from "../utils/href";

export interface HrefBootstrapProps {
  defaultHref?: string;
  syncWithUrl: boolean;
  children: React.ReactNode;
}

export function HrefBootstrap({
  defaultHref,
  syncWithUrl,
  children,
}: HrefBootstrapProps) {
  const href = useStore((state) => state.href);
  const setHref = useStore((state) => state.setHref);

  useEffect(() => {
    if (useStore.getState().href !== null) return;
    const initial = syncWithUrl
      ? resolveInitialHref(defaultHref)
      : defaultHref && isUrl(defaultHref)
        ? defaultHref
        : null;
    if (initial) setHref(initial);
  }, [defaultHref, syncWithUrl, setHref]);

  useEffect(() => {
    if (!syncWithUrl) return;
    if (href && new URLSearchParams(location.search).get("href") !== href)
      history.pushState(null, "", "?href=" + href);
    else if (!href) history.replaceState(null, "", location.pathname);
  }, [href, syncWithUrl]);

  useEffect(() => {
    if (!syncWithUrl) return;
    function handlePopState() {
      setHref(new URLSearchParams(location.search).get("href"));
    }
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [setHref, syncWithUrl]);

  return <>{children}</>;
}
