import type { Observable, ObservablePrimitive } from "@legendapp/state";
import { For } from "@legendapp/state/react";
import { memo } from "react";
import { Row } from "@/components/layout/row";
import { ScrollView } from "@/components/layout/scroll-view";
import { Chip } from "@/components/ui/chip";
import { Host } from "@/components/ui/host";

export const ListHeader = memo(function ListHeader({
  genre$,
  genres$,
}: {
  genre$: ObservablePrimitive<string>;
  genres$: Observable<
    () => {
      name: string;
      selected: boolean;
    }[]
  >;
}) {
  return (
    <Host matchContents={{ vertical: true }} className="w-full">
      <ScrollView direction="horizontal" showsIndicators={false}>
        <Row className="gutters gap-2 android:px-safe-offset-gx px-gx py-6">
          <For each={genres$} optimized>
            {(item$) => (
              <Chip
                variant="secondary"
                selected={item$.selected.get()}
                onPress={() => genre$.set(item$.name.get())}
              >
                <Chip.Label>{item$.name.get()}</Chip.Label>
              </Chip>
            )}
          </For>
        </Row>
      </ScrollView>
    </Host>
  );
});
