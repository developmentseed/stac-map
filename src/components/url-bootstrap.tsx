import { useStore } from "@/store";
import { idFromFragment, idToFragment, resolveInitialHref } from "@/utils/href";
import { resolveInitialProjection } from "@/utils/projection";
import { resolveInitialSearchParams } from "@/utils/search-params";
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
    if (useStore.getState().hrefIsParquet)
      useStore.getState().setStacGeoparquetId(idFromFragment());
    const projection = resolveInitialProjection();
    if (projection) useStore.getState().setProjection(projection);
    const viz = new URLSearchParams(location.search).get("viz");
    if (viz) useStore.getState().setVisualization(viz);
    const initialSearchParams = resolveInitialSearchParams();
    if (initialSearchParams)
      useStore.getState().setInitialSearchParams(initialSearchParams);
    return null;
  });

  const href = useStore((store) => store.href);
  const setHref = useStore((store) => store.setHref);
  const stacGeoparquetId = useStore((store) => store.stacGeoparquetId);
  const setStacGeoparquetId = useStore((store) => store.setStacGeoparquetId);

  useEffect(() => {
    if (href && new URLSearchParams(location.search).get("href") !== href)
      history.pushState(null, "", "?href=" + href);
    else if (!href) history.replaceState(null, "", location.pathname);
  }, [href]);

  useEffect(() => {
    if (!href || idFromFragment() === stacGeoparquetId) return;
    history.pushState(
      null,
      "",
      location.pathname + location.search + idToFragment(stacGeoparquetId)
    );
  }, [href, stacGeoparquetId]);

  useEffect(() => {
    function handlePopState() {
      setHref(new URLSearchParams(location.search).get("href"));
      if (useStore.getState().hrefIsParquet)
        setStacGeoparquetId(idFromFragment());
    }
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [setHref, setStacGeoparquetId]);

  return null;
}
