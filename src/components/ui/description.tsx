import { Prose } from "@/components/ui/prose";
import { Button, Center, Stack } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";

export default function Description({ description }: { description: string }) {
  const [lineClamp, setLineClamp] = useState(true);
  const [isClamped, setIsClamped] = useState(false);
  const descriptionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkClamp = () => {
      if (descriptionRef.current) {
        setIsClamped(
          descriptionRef.current.scrollHeight >
            descriptionRef.current.clientHeight
        );
      }
    };

    checkClamp();
    window.addEventListener("resize", checkClamp);
    return () => window.removeEventListener("resize", checkClamp);
  }, [description]);

  return (
    <Stack gap={4}>
      <Prose lineClamp={lineClamp ? 5 : undefined} ref={descriptionRef}>
        <Markdown>{description}</Markdown>
      </Prose>
      {isClamped && (
        <Center>
          <Button
            size={"sm"}
            variant={"outline"}
            onClick={() => setLineClamp((previous) => !previous)}
          >
            {lineClamp ? "Show full description..." : "Collapse description"}
          </Button>
        </Center>
      )}
    </Stack>
  );
}
