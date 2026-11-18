import { Checkbox } from "panelui-web/checkbox";
import { Frame } from "panelui-web/frame";
import { Sheet } from "panelui-web/sheet";
import { View } from "react-native";
import { EmptyState } from "@/components/blocks/empty-state";
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
      <Sheet.Header title="Custom lists" className="p-4" />
      <Sheet.Body className="px-4 pb-0">
        {/* The body is a scroll area's content, not a flex column. */}
        <View className="gap-4">
          {names.length > 0 ? (
            <Frame variant="plain" aria-label="Custom lists">
              <Frame.Panel data-attached="column">
                {names.map((name) => (
                  <Frame.Row
                    key={name}
                    // biome-ignore lint/a11y/noLabelWithoutControl: the Checkbox below is its control.
                    render={<label />}
                  >
                    <Frame.Media>
                      <Checkbox
                        label={name}
                        checked={selected.includes(name)}
                        onCheckedChange={() => toggle(name)}
                      />
                    </Frame.Media>
                    <Frame.Content>
                      <Frame.Title as="p">{name}</Frame.Title>
                    </Frame.Content>
                  </Frame.Row>
                ))}
              </Frame.Panel>
            </Frame>
          ) : (
            <EmptyState
              title="No custom lists yet"
              description="Name one above, then add this manga to it."
            />
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
