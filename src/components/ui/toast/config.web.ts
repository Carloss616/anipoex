import type { HeroUINativeConfig } from "heroui-native/provider";
import {
  Easing,
  FadeInDown,
  FadeInUp,
  FadeOutDown,
  FadeOutUp,
} from "react-native-reanimated";

/* HeroUI's default spring entering serializes to keyframes that never settle
   back on web, leaving the toast offset. A fixed duration does, and this bezier
   overshoots to keep the spring's snap — it's a CSS cubic-bezier 1:1. */
const SPRINGY = Easing.bezier(0.34, 1.56, 0.64, 1);

export const toastConfig: HeroUINativeConfig["toast"] = {
  defaultProps: {
    animation: {
      entering: {
        top: FadeInUp.duration(220).easing(SPRINGY),
        bottom: FadeInDown.duration(220).easing(SPRINGY),
      },
      exiting: {
        top: FadeOutUp.duration(140),
        bottom: FadeOutDown.duration(140),
      },
    },
  },
};
