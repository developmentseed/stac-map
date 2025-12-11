import { useEffect, useState } from "react";

function getCurrentHref(): string {
  return new URLSearchParams(location.search).get("href") || "";
}

function getInitialHref(): string | undefined {
  const href = getCurrentHref();
  try {
    new URL(href);
  } catch {
    return undefined;
  }
  return href;
}

export default function useHrefParam() {
  const [href, setHref] = useState<string | undefined>(getInitialHref());

  // Sync href with URL params
  useEffect(() => {
    if (href && getCurrentHref() != href) {
      history.pushState(null, "", "?href=" + href);
    } else if (href === "") {
      history.pushState(null, "", location.pathname);
    }
  }, [href]);

  // Handle browser back/forward
  useEffect(() => {
    function handlePopState() {
      setHref(getCurrentHref() ?? "");
    }
    window.addEventListener("popstate", handlePopState);

    if (getCurrentHref()) {
      try {
        new URL(getCurrentHref());
      } catch {
        history.pushState(null, "", location.pathname);
      }
    }

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return { href, setHref };
}
