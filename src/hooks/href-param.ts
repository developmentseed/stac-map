import { useEffect, useState } from "react";

function getInitialHref(): string | undefined {
  const href = new URLSearchParams(location.search).get("href") || "";
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
    if (href && new URLSearchParams(location.search).get("href") != href) {
      history.pushState(null, "", "?href=" + href);
    } else if (href === "") {
      history.pushState(null, "", location.pathname);
    }
  }, [href]);

  // Handle browser back/forward
  useEffect(() => {
    function handlePopState() {
      setHref(new URLSearchParams(location.search).get("href") ?? "");
    }
    window.addEventListener("popstate", handlePopState);

    const href = new URLSearchParams(location.search).get("href");
    if (href) {
      try {
        new URL(href);
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
