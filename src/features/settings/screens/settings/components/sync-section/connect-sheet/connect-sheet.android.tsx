import { Button, Column, Row } from "@expo/ui/jetpack-compose";
import {
  background,
  clip,
  fillMaxWidth,
  padding,
  Shapes,
} from "@expo/ui/jetpack-compose/modifiers";
import { useValue } from "@legendapp/state/react";
import { Text } from "@/components/native/jetpack-compose/text";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Loader } from "@/components/ui/loader";
import {
  closeConnect,
  connect$,
  copyCodeAndOpenGitHub,
} from "@/features/sync/state/connect-sheet";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";

/** Android: the code to type on GitHub; the app connects once it's authorized. */
export function ConnectSheet() {
  const open = useValue(connect$.open);
  const code = useValue(connect$.code);
  const error = useValue(connect$.error);
  const m3 = useThemeM3Colors();

  return (
    <BottomSheet isPresented={open} onDismiss={closeConnect}>
      <Text
        style={{ typography: "titleLarge" }}
        modifiers={[padding(16, 16, 16, 16)]}
      >
        Connect GitHub
      </Text>
      <Column
        verticalArrangement={{ spacedBy: 14 }}
        modifiers={[fillMaxWidth(), padding(16, 0, 16, 16)]}
      >
        <Text style={{ typography: "bodyMedium" }} color={m3.onSurfaceVariant}>
          Enter this code on GitHub. It connects here by itself.
        </Text>
        <Row
          horizontalArrangement="center"
          modifiers={[
            fillMaxWidth(),
            clip(Shapes.RoundedCorner(20)),
            background(m3.primaryContainer),
            padding(0, 16, 0, 16),
          ]}
        >
          <Text
            style={{ typography: "headlineMedium" }}
            color={m3.onPrimaryContainer}
          >
            {code?.userCode ?? "····-····"}
          </Text>
        </Row>
        <Button
          enabled={!!code}
          onClick={copyCodeAndOpenGitHub}
          modifiers={[fillMaxWidth()]}
        >
          <Text style={{ typography: "labelLarge" }}>
            Copy code and open GitHub
          </Text>
        </Button>
        {error ? (
          <Text style={{ typography: "bodyMedium" }} color={m3.error}>
            {error}
          </Text>
        ) : (
          <Row
            horizontalArrangement={{ spacedBy: 8 }}
            verticalAlignment="center"
          >
            <Loader size="sm" />
            <Text
              style={{ typography: "bodyMedium" }}
              color={m3.onSurfaceVariant}
            >
              Waiting for GitHub…
            </Text>
          </Row>
        )}
      </Column>
    </BottomSheet>
  );
}
