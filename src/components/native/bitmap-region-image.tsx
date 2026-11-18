import { requireNativeModule, requireNativeView } from "expo";
import { type StyleProp, View, type ViewStyle } from "react-native";

/** Image rows per band: 2048 rows of a 900px-wide strip are 7 MB of pixels. */
const BAND = 2048;

const Band = requireNativeView<{
  uri: string;
  regionTop: number;
  regionHeight: number;
  onError?: () => void;
  style: ViewStyle;
}>("BitmapRegionImage");

const native = requireNativeModule<{
  size(uri: string): Promise<{ width: number; height: number }>;
}>("BitmapRegionImage");

/** The image's size from its header, before any pixel is decoded. */
export const bitmapRegionImageSize = (uri: string) => native.size(uri);

export interface BitmapRegionImageProps {
  /** A local `file://` image. */
  uri: string;
  /** The image's height in pixels, from `bitmapRegionImageSize`. */
  height: number;
  /** A band couldn't be decoded (a format Android's decoder can't read). */
  onError?: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * A local image as bands of its rows, each decoded alone by Android's
 * `BitmapRegionDecoder` (`modules/bitmap-region-image`) and stretched to fill:
 * a tall image never sits in memory, nor on the GPU, whole. Plain Android
 * views: they sit in React Native's layout, no Host.
 */
export function BitmapRegionImage({
  uri,
  height,
  onError,
  style,
}: BitmapRegionImageProps) {
  return (
    <View style={style}>
      {Array.from({ length: Math.ceil(height / BAND) }, (_, band) => {
        const top = band * BAND;
        const rows = Math.min(BAND, height - top);
        return (
          <Band
            key={top}
            uri={uri}
            regionTop={top}
            regionHeight={rows}
            onError={onError}
            style={{ flex: rows }}
          />
        );
      })}
    </View>
  );
}
