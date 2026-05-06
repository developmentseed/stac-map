import { useStore } from "@/store";
import { resolveInitialHref } from "@/utils/href";
import { resolveInitialProjection } from "@/utils/projection";
import { useEffect, useState } from "react";

export default function UrlBootstrap({
  defaultHref,
}: {
  defaultHref?: string;
}) {
  useState(() => {
    if (useStore.getState().href !== null) return null;
    const initial = resolveInitialHref(defaultHref);
    if (initial) useStore.getState().setHref(initial);
    const projection = resolveInitialProjection();
    if (projection) useStore.getState().setProjection(projection);
    const viz = new URLSearchParams(location.search).get("viz");
    if (viz) useStore.getState().setVisualization(viz);
    return null;
  });

  const href = useStore((store) => store.href);
  const setHref = useStore((store) => store.setHref);

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
