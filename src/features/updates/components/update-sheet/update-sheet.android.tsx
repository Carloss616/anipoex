import { Button, Column, Row, TextButton } from "@expo/ui/jetpack-compose";
import {
  fillMaxWidth,
  padding,
  verticalScroll,
} from "@expo/ui/jetpack-compose/modifiers";
import { useValue } from "@legendapp/state/react";
import { Text } from "@/components/native/jetpack-compose/text";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Progress } from "@/components/ui/progress";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { openExternal } from "@/utils/open-external";
import { installUpdate, isUpdateReady, updates$ } from "../../state/updates";
import { ReleaseNotes } from "./release-notes";

const megabytes = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;
const close = () => updates$.open.set(false);

export function UpdateSheet() {
  const open = useValue(updates$.open);
  const update = useValue(updates$.available);
  const progress = useValue(updates$.progress);
  const error = useValue(updates$.error);
  const ready = useValue(isUpdateReady);
  const m3 = useThemeM3Colors();

  return (
    <BottomSheet isPresented={open && !!update} onDismiss={close}>
      {update ? (
        <Column
          verticalArrangement={{ spacedBy: 16 }}
          modifiers={[verticalScroll(), fillMaxWidth(), padding(16, 0, 16, 16)]}
        >
          <Column>
            <Text style={{ typography: "titleLarge" }}>Update available</Text>
            <Text
              style={{ typography: "bodyMedium" }}
              color={m3.onSurfaceVariant}
            >
              {`Anipoex ${update.version} · ${megabytes(update.apkSize)}`}
            </Text>
          </Column>
          {progress === undefined ? (
            <Row horizontalArrangement={{ spacedBy: 8 }}>
              <Button onClick={installUpdate}>
                <Text style={{ typography: "labelLarge" }}>
                  {ready ? "Install" : "Update"}
                </Text>
              </Button>
              <TextButton onClick={() => openExternal(update.url)}>
                <Text style={{ typography: "labelLarge" }}>View on GitHub</Text>
              </TextButton>
            </Row>
          ) : (
            <Column verticalArrangement={{ spacedBy: 8 }}>
              <Text
                style={{ typography: "bodyMedium" }}
                color={m3.onSurfaceVariant}
              >
                {`Downloading… ${Math.round(progress * 100)}%`}
              </Text>
              <Progress value={progress * 100} />
            </Column>
          )}
          {error ? (
            <Text style={{ typography: "bodyMedium" }} color={m3.error}>
              {error}
            </Text>
          ) : null}
          <ReleaseNotes markdown={update.notes} />
        </Column>
      ) : null}
    </BottomSheet>
  );
}
