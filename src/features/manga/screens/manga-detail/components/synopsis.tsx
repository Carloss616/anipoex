import { useState } from "react";
import { Typography } from "@/components/ui/typography";
import { MANGA_DETAIL } from "../../../mocks";

export function Synopsis() {
  const [collapse, setCollapse] = useState(false);

  return (
    <Typography
      numberOfLines={collapse ? undefined : 2}
      color="muted"
      onPress={() => setCollapse((c) => !c)}
    >
      {MANGA_DETAIL.synopsis}
    </Typography>
  );
}
