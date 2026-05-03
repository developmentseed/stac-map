import { useEffect } from "react";
import { toaster } from "./ui/toaster";

export default function ErrorListener() {
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      toaster.create({
        title: "Error",
        description: event.message,
        type: "error",
      });
    };

    const onRejection = (event: PromiseRejectionEvent) => {
      console.log(event);
      toaster.create({
        title: "Unhandled rejection",
        description:
          event.reason instanceof Error
            ? event.reason.message
            : String(event.reason),
        type: "error",
      });
    };

    window.addEventListener("error", onError, true);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError, true);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
