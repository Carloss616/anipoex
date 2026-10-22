import {
  createViewModifierEventListener,
  type ModifierConfig,
} from "@expo/ui/swift-ui/modifiers";
import { requireNativeView } from "expo";
import type {
  ImageProps as ExpoImageProps,
  ImageErrorEventData,
  ImageLoadEventData,
  ImageSource,
} from "expo-image";

/**
 * The expo-image props the native images take, with expo-image's names and
 * events, so a screen moves to them by its import. The Compose Image takes the
 * same. `onLoad`'s width and height are the decoded image's, which keeps the
 * aspect ratio but can be smaller: Android decodes at the drawn size, iOS
 * scales down what would pass 60 MB.
 */
export interface NativeImageProps
  extends Pick<ExpoImageProps, "blurRadius" | "onLoad" | "onError"> {
  /** An https or `data:` URL, and headers sent with it (a `Referer` a host requires). */
  source: Pick<ImageSource, "uri" | "headers">;
  /** `cover` fills and crops the frame, `contain` shows the whole image inside it, `fill` stretches it. Default `cover`. */
  contentFit?: Extract<
    ExpoImageProps["contentFit"],
    "cover" | "contain" | "fill"
  >;
  /** Fade-in in ms when the image arrives; 0 draws it at once. Default 250. */
  transition?: number;
}

export interface ImageProps extends NativeImageProps {
  modifiers?: ModifierConfig[];
}

type NativeProps = Omit<ImageProps, "onLoad" | "onError"> & {
  onLoad?: (event: { nativeEvent: ImageLoadEventData }) => void;
  onError?: (event: { nativeEvent: ImageErrorEventData }) => void;
};

const NativeImage = requireNativeView<NativeProps>("NativeImage", "ImageView");

/**
 * A SwiftUI image that fills its frame, loaded and cached by SDWebImage
 * (expo-image's engine) from the local `modules/native-image`, and fades in.
 * Must sit inside a Host; use it instead of an `RNHostView` image:
 * `List.ForEach` recycling can leave a hosted React Native view in a removed row.
 */
export function Image({ modifiers, onLoad, onError, ...props }: ImageProps) {
  return (
    <NativeImage
      {...props}
      onLoad={onLoad && ((event) => onLoad(event.nativeEvent))}
      onError={onError && ((event) => onError(event.nativeEvent))}
      modifiers={modifiers}
      {...(modifiers ? createViewModifierEventListener(modifiers) : undefined)}
    />
  );
}
