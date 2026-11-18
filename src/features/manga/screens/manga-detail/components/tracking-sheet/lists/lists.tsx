import { Typography } from "panelui-native/components/typography";
import { Frame } from "panelui-web/frame";
import { Sheet } from "panelui-web/sheet";
import { View } from "react-native";
import { SHEET_INSET } from "@/components/ui/bottom-sheet";
import { Icon, Icons } from "@/components/ui/icon";
import { NewListField } from "@/features/manga/components/new-list-field";
import type { TrackingForm } from "@/features/manga/utils/tracking-form";
import { Footer } from "../footer";
import { useLists } from "./hooks/use-lists";

export interface ListsProps {
  form: TrackingForm;
  onCancel: () => void;
  onConfirm: (next: TrackingForm) => void;
}

/** The custom lists holding the manga, any number of them. */
export function Lists({ form, onCancel, onConfirm }: ListsProps) {
  const { names, selected, toggle, next, dirty, create } = useLists(form);

  return (
    <>
      <Sheet.Header title="Custom lists" className={SHEET_INSET.header} />
      <Sheet.Body className={SHEET_INSET.body}>
        {/* The body is a scroll area's content, not a flex column. */}
        <View className="gap-4">
          {names.length > 0 ? (
            <Frame variant="plain" aria-label="Custom lists">
              <Frame.Panel data-attached="column">
                {names.map((name) => (
                  <Frame.Row
                    key={name}
                    role="checkbox"
                    aria-checked={selected.includes(name)}
                    onClick={() => toggle(name)}
                  >
                    <Frame.Content>
                      <Frame.Title as="p">{name}</Frame.Title>
                    </Frame.Content>
                    {selected.includes(name) && (
                      <Frame.Actions>
                        <Icon name={Icons.check} className="text-primary" />
                      </Frame.Actions>
                    )}
                  </Frame.Row>
                ))}
              </Frame.Panel>
            </Frame>
          ) : (
            <Typography muted>No custom lists yet.</Typography>
          )}
          <NewListField names={names} onSubmit={create} />
        </View>
      </Sheet.Body>

      <Footer
        onCancel={onCancel}
        onConfirm={() => onConfirm(next)}
        canConfirm={dirty}
      />
    </>
  );
}
