import type { ObservablePrimitive } from "@legendapp/state";
import { Memo } from "@legendapp/state/react";
import { memo } from "react";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { ALL } from "@/features/manga/hooks/use-manga-list";

export const ListEmpty = memo(function ListEmpty({
  genre$,
  query$,
}: {
  genre$: ObservablePrimitive<string>;
  query$: ObservablePrimitive<string>;
}) {
  return (
    <EmptyState
      title="Nothing here"
      description={
        <Memo>
          {() =>
            query$.get()
              ? `We couldn't find any manga for “${query$.get()}”.`
              : genre$.get() === ALL
                ? "This list is empty."
                : `No manga in “${genre$.get()}” yet.`
          }
        </Memo>
      }
    >
      <Memo>
        {() =>
          genre$.get() !== ALL && (
            <Button
              variant="secondary"
              size="sm"
              className="mt-1"
              onPress={() => genre$.set(ALL)}
            >
              Show all
            </Button>
          )
        }
      </Memo>
    </EmptyState>
  );
});
