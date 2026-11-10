import { observable } from "@legendapp/state";
import { toSources, withChosen } from "./sources";

/**
 * A mock of `@/features/extensions` with every name a tested module imports:
 * the first `mock.module` of a run fixes the names it exports, and a later
 * file's mock only changes their values.
 */
export const mockExtensions = (overrides: Record<string, unknown>) => ({
  runtime: {},
  installed$: observable([]),
  installedLoaded$: observable(true),
  refreshInstalled: async () => {},
  toSources,
  withChosen,
  ...overrides,
});
