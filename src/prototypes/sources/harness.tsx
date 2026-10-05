import { useLocalSearchParams, useRouter } from "expo-router";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { Host } from "@/components/ui/host";
import { useExtensionsStore } from "./data";
import { ProtoPicker } from "./picker";
import { ManagerVariant } from "./variants/manager";
import { MarketplaceVariant } from "./variants/marketplace";
import { WorkbenchVariant } from "./variants/workbench";

export const VARIANT_NAMES = ["Manager", "Marketplace", "Workbench"] as const;

export function SourcesPrototypeHarness() {
  const router = useRouter();
  const params = useLocalSearchParams<{ v?: string }>();
  const initial = Math.min(
    Math.max((Number.parseInt(String(params.v ?? "1"), 10) || 1) - 1, 0),
    VARIANT_NAMES.length - 1,
  );
  const [index, setIndex] = useState(initial);
  const [replayKey, setReplayKey] = useState(0);
  const store = useExtensionsStore();

  useEffect(() => {
    setIndex(initial);
  }, [initial]);

  const setVariant = useCallback(
    (next: number) => {
      setIndex(next);
      router.setParams({ v: String(next + 1) });
    },
    [router],
  );

  const replay = useCallback(() => {
    setReplayKey((k) => k + 1);
  }, []);

  let stage: ReactNode;
  switch (index) {
    case 1:
      stage = <MarketplaceVariant store={store} />;
      break;
    case 2:
      stage = <WorkbenchVariant store={store} />;
      break;
    default:
      stage = <ManagerVariant store={store} />;
  }

  return (
    <Host className="flex-1 bg-background">
      <View key={`${index}-${replayKey}`} className="flex-1">
        {stage}
      </View>
      <ProtoPicker
        variants={[...VARIANT_NAMES]}
        index={index}
        onChange={setVariant}
        onReplay={replay}
        showReplay
      />
    </Host>
  );
}
