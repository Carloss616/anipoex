import {
  createViewModifierEventListener,
  type ModifierConfig,
} from "@expo/ui/jetpack-compose/modifiers";
import { requireNativeView } from "expo";
import type { ImageErrorEventData, ImageLoadEventData } from "expo-image";
import type { NativeImageProps } from "@/components/native/swift-ui/image";

export interface ImageProps extends NativeImageProps {
  /** Must give it a size (`matchParentSize()`, `size(…)`): it draws nothing until laid out. */
  modifiers?: ModifierConfig[];
}

type NativeProps = Omit<ImageProps, "onLoad" | "onError"> & {
  onLoad?: (event: { nativeEvent: ImageLoadEventData }) => void;
  onError?: (event: { nativeEvent: ImageErrorEventData }) => void;
};

const NativeImage = requireNativeView<NativeProps>("NativeImage", "ImageView");

/**
 * A Compose image that fills its frame, loaded and cached by Glide (expo-image's
 * engine) from the local `modules/native-image`, at the size it's drawn, and
 * fades in. Must sit inside a Host; use it instead of @expo/ui's `Image` for
 * remote images, which decodes them at full size and crashes on an oversized one.
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
