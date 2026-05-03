import { useEffect } from "react";
import { useStore } from "../store";
import { toaster } from "./ui/toaster";

export default function ErrorListener() {
  const addErrorListener = useStore((store) => store.addErrorListener);

  useEffect(() => {
    if (!addErrorListener) return;

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
  }, [addErrorListener]);

  return null;
}
