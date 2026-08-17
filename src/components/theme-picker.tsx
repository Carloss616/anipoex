import { Memo } from "@legendapp/state/react";
import { View } from "react-native";
import { Row } from "@/components/layout/row";
import { Button } from "@/components/ui/button";
import { RNHostView } from "@/components/ui/host";
import { THEME_FAMILIES, theme$ } from "@/state/theme";

export function ThemePicker() {
  return (
    <Row className="web:self-auto! gap-3">
      {THEME_FAMILIES.map((entry) => (
        <Memo key={entry.id}>
          {() => (
            <Button
              variant={
                theme$.family.get() === entry.id ? "secondary" : "outline"
              }
              onPress={() => theme$.family.set(entry.id)}
            >
              {entry.name}
              <RNHostView matchContents>
                <Memo>
                  {() => (
                    <View
                      className="size-3 rounded-full"
                      style={{
                        backgroundColor:
                          entry.swatch[theme$.mode.get() === "dark" ? 1 : 0],
                      }}
                    />
                  )}
                </Memo>
              </RNHostView>
            </Button>
          )}
        </Memo>
      ))}
    </Row>
  );
}
