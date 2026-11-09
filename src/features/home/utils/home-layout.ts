import {
  PRESET_LABELS,
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

export const toggled = (layout: HomeLayout, id: SectionId): HomeLayout => ({
  ...layout,
  preset: "custom",
  on: layout.on.includes(id)
    ? layout.on.filter((on) => on !== id)
    : [...layout.on, id],
});

export function moved(
  layout: HomeLayout,
  id: SectionId,
  to: number,
): HomeLayout {
  const order = layout.order.filter((section) => section !== id);
  order.splice(Math.max(0, Math.min(to, order.length)), 0, id);
  return { ...layout, preset: "custom", order };
}

export const visibleSections = (layout: HomeLayout): SectionId[] =>
  layout.order.filter((id) => layout.on.includes(id));

/** "Balanced · 7 sections", for the settings row that opens the editor. */
export function layoutSummary(layout: HomeLayout): string {
  const count = visibleSections(layout).length;
  return `${PRESET_LABELS[layout.preset]} · ${count} section${count === 1 ? "" : "s"}`;
}

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
