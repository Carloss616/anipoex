import { useValue } from "@legendapp/state/react";
import { memo } from "react";
import { SECTIONS, type SectionId } from "@/features/home/constants";
import type { HomeSectionsQuery } from "@/features/home/graphql/home-sections.generated";
import { useContinueReading } from "@/features/home/hooks/use-continue-reading";
import {
  sectionActivities,
  sectionGenres,
  sectionMedia,
  sectionTitle,
} from "@/features/home/utils/section-data";
import { session$ } from "@/state/session";
import { ActivitySection } from "./activity-section";
import { ContinueSection } from "./continue-section";
import { GenreSection } from "./genre-section";
import { HeroSection } from "./hero-section";
import { RailSection } from "./rail-section";
import { SectionPlaceholder } from "./section-placeholder";

export interface HomeSectionProps {
  id: SectionId;
  data: HomeSectionsQuery | undefined;
  loading: boolean;
}

/** One section of Home, on every platform: its data, else a placeholder. */
export const HomeSection = memo(function HomeSection({
  id,
  data,
  loading,
}: HomeSectionProps) {
  const { kind, params } = SECTIONS[id];
  const viewerId = useValue(() => session$.user.get()?.id);
  if (kind === "continue") return <ContinueReading />;
  if (!data) return loading ? <SectionPlaceholder id={id} /> : null;

  const title = sectionTitle(data, id);
  switch (kind) {
    case "hero":
    case "rail": {
      const media = sectionMedia(data, id);
      if (!media.length) return null;
      return kind === "hero" ? (
        <HeroSection title={title} media={media} params={params} />
      ) : (
        <RailSection title={title} media={media} params={params} />
      );
    }
    case "genres": {
      const genres = sectionGenres(data);
      return genres.length ? (
        <GenreSection title={title} genres={genres} />
      ) : null;
    }
    case "activity": {
      const activities = sectionActivities(
        data,
        id as "following" | "global",
        viewerId,
      );
      return activities.length ? (
        <ActivitySection title={title} activities={activities} />
      ) : null;
    }
  }
});

/** Its own component, so its queries run only while the section is on. */
function ContinueReading() {
  const items = useContinueReading();
  return items.length ? (
    <ContinueSection title={SECTIONS.continue.title} items={items} />
  ) : null;
}
