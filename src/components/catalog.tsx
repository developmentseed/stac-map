import { SkeletonText } from "@chakra-ui/react";
import useStacMap from "../hooks/stac-map";
import Collections from "./collections";

export default function Catalog() {
  const { collections } = useStacMap();

  return (
    (collections && <Collections collections={collections}></Collections>) || (
      <SkeletonText noOfLines={3}></SkeletonText>
    )
  );
}
