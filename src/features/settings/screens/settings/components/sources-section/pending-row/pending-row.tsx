import { Memo } from "@legendapp/state/react";
import { useRouter } from "expo-router";
import { Frame } from "panelui-web/frame";
import { Badge } from "@/components/ui/badge";
import { DESCRIPTIONS } from "@/features/settings/constants";
import { countLabel } from "./utils";

export interface PendingRowProps {
  /**
   * Its place in the section, for its corners.
   * @platform android
   */
  index?: number;
  /** @platform android */
  count?: number;
}

// Takes the props so the Android file, typed through this one, can.
export function PendingRow(_: PendingRowProps) {
  const router = useRouter();

  return (
    <Frame.Row chevron onClick={() => router.push("/settings/pending")}>
      <Frame.Content>
        <Frame.Title as="p">Pending</Frame.Title>
        <Frame.Description>{DESCRIPTIONS.pending}</Frame.Description>
      </Frame.Content>
      <Frame.Actions>
        <Memo>
          {() => {
            const count = countLabel();
            return count ? <Badge color="inherit">{count}</Badge> : null;
          }}
        </Memo>
      </Frame.Actions>
    </Frame.Row>
  );
}
