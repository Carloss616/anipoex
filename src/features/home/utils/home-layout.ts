import { moveTo } from "@/utils/move-to";
import {
  PRESETS,
  type Preset,
  SECTION_IDS,
  type SectionId,
} from "../constants";

/** `order` holds every section once; `on` the ones Home shows. */
export interface HomeLayout {
  preset: Preset | "custom";
  order: SectionId[];
  on: SectionId[];
}

export function withPreset(preset: Preset): HomeLayout {
  const on = PRESETS[preset];
  return {
    preset,
    order: [...on, ...SECTION_IDS.filter((id) => !on.includes(id))],
    on: [...on],
  };
}

export const visibleSections = (layout: HomeLayout): SectionId[] =>
  layout.order.filter((id) => layout.on.includes(id));

/** The preset whose sections Home now shows, in its order; else custom. */
function matched(layout: HomeLayout): HomeLayout {
  const shown = visibleSections(layout).join();
  const preset = (Object.keys(PRESETS) as Preset[]).find(
    (key) => PRESETS[key].join() === shown,
  );
  return { ...layout, preset: preset ?? "custom" };
}

export const toggled = (layout: HomeLayout, id: SectionId): HomeLayout =>
  matched({
    ...layout,
    on: layout.on.includes(id)
      ? layout.on.filter((on) => on !== id)
      : [...layout.on, id],
  });

export const moved = (
  layout: HomeLayout,
  id: SectionId,
  to: number,
): HomeLayout => matched({ ...layout, order: moveTo(layout.order, id, to) });

const isSectionId = (id: unknown): id is SectionId =>
  SECTION_IDS.includes(id as SectionId);

const sectionIds = (ids: unknown[]) => [...new Set(ids.filter(isSectionId))];

/**
 * A layout saved by another build: unknown ids go, ids it lacks come back
 * hidden at the end.
 */
export function normalizeLayout(raw: unknown): HomeLayout {
  const { preset, order, on } = (raw ?? {}) as Partial<
    Record<keyof HomeLayout, unknown>
  >;
  if (
    !Array.isArray(order) ||
    !Array.isArray(on) ||
    !(preset === "custom" || (typeof preset === "string" && preset in PRESETS))
  )
    return withPreset("balanced");
  const known = sectionIds(order);
  return {
    preset: preset as HomeLayout["preset"],
    order: [...known, ...SECTION_IDS.filter((id) => !known.includes(id))],
    on: sectionIds(on),
  };
}
