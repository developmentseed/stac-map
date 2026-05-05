import { useStore } from "@/store";
import { resolveInitialHref } from "@/utils/href";
import { resolveInitialProjection } from "@/utils/projection";
import { useEffect } from "react";

export default function UrlBootstrap({
  defaultHref,
}: {
  defaultHref?: string;
}) {
  const href = useStore((store) => store.href);
  const setHref = useStore((store) => store.setHref);
  const setProjection = useStore((store) => store.setProjection);

  useEffect(() => {
    if (useStore.getState().href !== null) return;
    const initial = resolveInitialHref(defaultHref);
    if (initial) setHref(initial);
    const projection = resolveInitialProjection();
    if (projection) setProjection(projection);
  }, [defaultHref, setHref, setProjection]);

  useEffect(() => {
    if (href && new URLSearchParams(location.search).get("href") !== href)
      history.pushState(null, "", "?href=" + href);
    else if (!href) history.replaceState(null, "", location.pathname);
  }, [href]);

  useEffect(() => {
    function handlePopState() {
      setHref(new URLSearchParams(location.search).get("href"));
    }
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [setHref]);

  return null;
}
