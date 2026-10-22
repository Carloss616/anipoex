import ExpoModulesCore
import ExpoUI
import SDWebImage
import SwiftUI

public class NativeImageModule: Module {
  public func definition() -> ModuleDefinition {
    Name("NativeImage")

    ExpoUIView(ImageView.self)
  }
}

struct ImageSource: Record {
  @Field var uri: String?
  @Field var headers: [String: String]?
}

enum ContentFit: String, Enumerable {
  case cover
  case contain
  case fill
}

public final class ImageViewProps: UIBaseViewProps {
  @Field var source: ImageSource?
  @Field var contentFit: ContentFit = .cover
  @Field var transition: Double = 250
  @Field var blurRadius: Double = 0
  var onLoad = EventDispatcher()
  var onError = EventDispatcher()
}

private let cacheTypes: [SDImageCacheType: String] = [.memory: "memory", .disk: "disk", .all: "disk"]

/// An image from an https or data URL, loaded and cached by SDWebImage (expo-image's engine) and drawn by SwiftUI itself: a React Native view hosted in a recycled `List` row can be taken by a row SwiftUI is removing.
public struct ImageView: ExpoSwiftUI.View {
  @ObservedObject public var props: ImageViewProps
  @State private var loaded: (url: String, image: UIImage, cacheType: String)?

  public init(props: ImageViewProps) {
    self.props = props
  }

  public var body: some View {
    let url = props.source?.uri
    // A memory hit draws in the first frame, so a row scrolled back into view doesn't fade in again.
    let shown = url.flatMap { url in
      loaded?.url == url ? loaded : SDImageCache.shared.imageFromMemoryCache(forKey: url).map { (url: url, image: $0, cacheType: "memory") }
    }
    Color.clear
      .overlay {
        if let shown {
          fitted(Image(uiImage: shown.image).resizable())
            // Opaque only when blurred, or a logo's transparent pixels could be filled.
            .blur(radius: props.blurRadius, opaque: props.blurRadius > 0)
            .transition(.opacity)
            // A new view per url, so a recycled row reports its own load.
            .id(shown.url)
            // expo-image's load event, so a screen moves here by its import.
            .onAppear {
              props.onLoad([
                "cacheType": shown.cacheType,
                "source": [
                  "url": shown.url,
                  "width": shown.image.size.width,
                  "height": shown.image.size.height,
                  "mediaType": String?.none,
                ] as [String: Any?],
              ])
            }
        }
      }
      .clipped()
      .task(id: url) {
        guard let url, shown == nil, let source = URL(string: url) else { return }
        let context: [SDWebImageContextOption: Any]? = props.source?.headers.map { [.downloadRequestModifier: SDWebImageDownloaderRequestModifier(headers: $0)] }
        let duration = props.transition / 1000
        // A source's oversized cover would take hundreds of MB decoded: past 60 MB it decodes scaled down, keeping its aspect ratio.
        SDWebImageManager.shared.loadImage(with: source, options: [.scaleDownLargeImages], context: context, progress: nil) { image, _, error, cacheType, _, _ in
          guard let image else {
            // A recycled row may have moved on to another url by now.
            if props.source?.uri == url { props.onError(["error": error?.localizedDescription ?? "Could not load the image"]) }
            return
          }
          withAnimation(duration > 0 ? .easeIn(duration: duration) : nil) { loaded = (url, image, cacheTypes[cacheType] ?? "none") }
        }
      }
  }

  @ViewBuilder
  private func fitted(_ image: Image) -> some View {
    switch props.contentFit {
    case .fill: image
    case .contain: image.aspectRatio(contentMode: .fit)
    case .cover: image.aspectRatio(contentMode: .fill)
    }
  }
}
