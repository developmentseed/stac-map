import { Card, Skeleton, SkeletonText } from "@chakra-ui/react";

export default function SkeletonCard() {
  return (
    <Card.Root size={"sm"}>
      <Card.Body>
        <Skeleton height="1.2em" width="60%" />
        <SkeletonText noOfLines={2} mt={2} />
      </Card.Body>
    </Card.Root>
  );
}
