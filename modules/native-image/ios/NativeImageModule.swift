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

enum ContentFit: String, Enumerable {
  case cover
  case contain
}

public final class ImageViewProps: UIBaseViewProps {
  @Field var url: String?
  @Field var headers: [String: String]?
  @Field var contentFit: ContentFit = .cover
  @Field var transition: Double = 250
  @Field var blurRadius: Double = 0
  var onLoad = EventDispatcher()
  var onError = EventDispatcher()
}

/// An image from an https or data URL, loaded and cached by SDWebImage (expo-image's engine) and drawn by SwiftUI itself: a React Native view hosted in a recycled `List` row can be taken by a row SwiftUI is removing.
public struct ImageView: ExpoSwiftUI.View {
  @ObservedObject public var props: ImageViewProps
  @State private var loaded: (url: String, image: UIImage)?

  public init(props: ImageViewProps) {
    self.props = props
  }

  public var body: some View {
    let url = props.url
    // A memory hit draws in the first frame, so a row scrolled back into view doesn't fade in again.
    let image = url.flatMap { url in loaded?.url == url ? loaded?.image : SDImageCache.shared.imageFromMemoryCache(forKey: url) }
    Color.clear
      .overlay {
        if let image {
          Image(uiImage: image)
            .resizable()
            .aspectRatio(contentMode: props.contentFit == .contain ? .fit : .fill)
            // Opaque only when blurred, or a logo's transparent pixels could be filled.
            .blur(radius: props.blurRadius, opaque: props.blurRadius > 0)
            .transition(.opacity)
            // A new view per url, so a recycled row reports its own load.
            .id(url)
            .onAppear { props.onLoad() }
        }
      }
      .clipped()
      .task(id: url) {
        guard let url, image == nil, let source = URL(string: url) else { return }
        let context: [SDWebImageContextOption: Any]? = props.headers.map { [.downloadRequestModifier: SDWebImageDownloaderRequestModifier(headers: $0)] }
        let duration = props.transition / 1000
        SDWebImageManager.shared.loadImage(with: source, options: [], context: context, progress: nil) { image, _, error, _, _, _ in
          guard let image else {
            // A recycled row may have moved on to another url by now.
            if props.url == url { props.onError(["error": error?.localizedDescription ?? "Could not load the image"]) }
            return
          }
          withAnimation(duration > 0 ? .easeIn(duration: duration) : nil) { loaded = (url, image) }
        }
      }
  }
}
