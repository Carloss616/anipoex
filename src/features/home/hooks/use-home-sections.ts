import { skipToken, useQuery } from "@apollo/client/react";
import { useValue } from "@legendapp/state/react";
import { useMemo } from "react";
import { session$ } from "@/state/session";
import type { SectionId } from "../constants";
import {
  HomeSectionsDocument,
  type HomeSectionsQuery,
} from "../graphql/home-sections.generated";
import { sectionVariables } from "../utils/section-variables";

/** Every visible section in one request, so Home costs one rate-limit hit. */
export function useHomeSections(visible: SectionId[]): {
  data: HomeSectionsQuery | undefined;
  loading: boolean;
  error: boolean;
  refetch: () => void;
} {
  const userId = useValue(session$.user)?.id;
  // Keyed on the ids: a new array with the same ids is the same query.
  const key = visible.join();
  const variables = useMemo(
    () =>
      userId == null
        ? null
        : sectionVariables(
            key ? (key.split(",") as SectionId[]) : [],
            userId,
            new Date(),
          ),
    [key, userId],
  );

  const { data, loading, error, refetch } = useQuery(
    HomeSectionsDocument,
    variables == null
      ? skipToken
      : { variables, context: { errorMessage: "Couldn't load Home" } },
  );

  return { data, loading, error: error != null, refetch };
}
