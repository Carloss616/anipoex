import {
  createViewModifierEventListener,
  type ModifierConfig,
} from "@expo/ui/swift-ui/modifiers";
import { requireNativeView } from "expo";

export interface ImageProps {
  /** An https or `data:` URL. */
  url: string;
  /** Sent with the request, e.g. a `Referer` a host requires. */
  headers?: Record<string, string>;
  /** `cover` fills and crops the frame; `contain` shows the whole image inside it. Default `cover`. */
  contentFit?: "cover" | "contain";
  /** Fade-in in ms when the image arrives; 0 draws it at once. Default 250. */
  transition?: number;
  /** Blurs inside the frame, edges kept opaque. */
  blurRadius?: number;
  /** Fires when the image is drawn, again whenever it reappears. */
  onLoad?: () => void;
  /** Fires when the image can't be loaded or decoded. */
  onError?: (error: string) => void;
  modifiers?: ModifierConfig[];
}

type NativeImageProps = Omit<ImageProps, "onError"> & {
  onError?: (event: { nativeEvent: { error: string } }) => void;
};

const NativeImage = requireNativeView<NativeImageProps>(
  "NativeImage",
  "ImageView",
);

/**
 * A SwiftUI image that fills its frame, loaded and cached by SDWebImage
 * (expo-image's engine) from the local `modules/native-image`, and fades in.
 * Must sit inside a Host; use it instead of an `RNHostView` image:
 * `List.ForEach` recycling can leave a hosted React Native view in a removed row.
 */
export function Image({ modifiers, onError, ...props }: ImageProps) {
  return (
    <NativeImage
      {...props}
      onError={onError && ((event) => onError(event.nativeEvent.error))}
      modifiers={modifiers}
      {...(modifiers ? createViewModifierEventListener(modifiers) : undefined)}
    />
  );
}
