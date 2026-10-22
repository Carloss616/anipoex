import CoreGraphics
import Foundation
import ImageIO
import UniformTypeIdentifiers

/// android.graphics' renderer (`renderImage`, see ImageEngine.kt): ImageIO decodes, Core Graphics draws the bitmaps in
/// order, each from the ones before it, and the last is encoded. ImageIO can't write WebP here, so that comes out as JPEG.
enum GraphicsHost {
  static func answer(_ argsJson: String) -> String {
    do {
      return ChallengeHost.envelope(["result": try render(argsJson)])
    } catch {
      return ChallengeHost.envelope(["error": (error as? GraphicsError)?.message ?? error.localizedDescription])
    }
  }

  private static func render(_ argsJson: String) throws -> String {
    let args = (try JSONSerialization.jsonObject(with: Data(argsJson.utf8))) as? [String: Any] ?? [:]
    let decoded = try (args["images"] as? [String] ?? []).map { base64 in
      guard let data = Data(base64Encoded: base64), let source = CGImageSourceCreateWithData(data as CFData, nil),
            let image = CGImageSourceCreateImageAtIndex(source, 0, nil) else { throw GraphicsError("Could not decode an image") }
      return image
    }
    let bitmaps = args["bitmaps"] as? [[String: Any]] ?? []
    var drawn: [CGImage] = []
    for (index, bitmap) in bitmaps.enumerated() {
      let width = bitmap["width"] as? Int ?? 0
      let height = bitmap["height"] as? Int ?? 0
      let ops = bitmap["ops"] as? [[String: Any]] ?? []
      let image = (bitmap["image"] as? Int).flatMap { decoded.indices.contains($0) ? decoded[$0] : nil }
      if let image, ops.isEmpty, index < bitmaps.count - 1 {
        drawn.append(image)
        continue
      }
      guard let space = CGColorSpace(name: CGColorSpace.sRGB),
            let context = CGContext(data: nil, width: width, height: height, bitsPerComponent: 8, bytesPerRow: 0, space: space,
                                    bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue) else {
        throw GraphicsError("Could not make a \(width)×\(height) bitmap")
      }
      // Android's y axis points down; a bitmap drawn without a paint isn't filtered.
      context.translateBy(x: 0, y: CGFloat(height))
      context.scaleBy(x: 1, y: -1)
      context.interpolationQuality = .none
      let whole = CGRect(x: 0, y: 0, width: width, height: height)
      if let image { draw(image, from: CGRect(x: 0, y: 0, width: image.width, height: image.height), to: whole, in: context) }
      for op in ops {
        if let fill = op["fill"] as? Int {
          let argb = UInt32(truncatingIfNeeded: fill)
          let channel = { (shift: UInt32) in CGFloat((argb >> shift) & 0xFF) / 255 }
          context.setFillColor(CGColor(srgbRed: channel(16), green: channel(8), blue: channel(0), alpha: channel(24)))
          context.fill(whole)
          continue
        }
        guard let at = op["bitmap"] as? Int, drawn.indices.contains(at), let src = rect(op["src"]), let dst = rect(op["dst"]),
              let m = op["matrix"] as? [Double], m.count == 6 else { throw GraphicsError("A draw is missing its bitmap or rects") }
        let source = drawn[at]
        context.saveGState()
        context.concatenate(CGAffineTransform(a: m[0], b: m[1], c: m[2], d: m[3], tx: m[4], ty: m[5]))
        draw(source, from: src, to: dst, in: context)
        context.restoreGState()
      }
      guard let image = context.makeImage() else { throw GraphicsError("Could not draw a bitmap") }
      drawn.append(image)
    }
    guard let result = drawn.last else { throw GraphicsError("Nothing to draw") }
    let png = args["type"] as? String == "png"
    let data = NSMutableData()
    guard let destination = CGImageDestinationCreateWithData(data, (png ? UTType.png : UTType.jpeg).identifier as CFString, 1, nil) else {
      throw GraphicsError("Could not encode the image")
    }
    let quality = Double(args["quality"] as? Int ?? 100) / 100
    CGImageDestinationAddImage(destination, result, [kCGImageDestinationLossyCompressionQuality: quality] as CFDictionary)
    guard CGImageDestinationFinalize(destination) else { throw GraphicsError("Could not encode the image") }
    return data.base64EncodedString()
  }

  /// Draws `src` of `image` (top-left origin, as Android's) into `dst` of a context whose y axis points down.
  private static func draw(_ image: CGImage, from src: CGRect, to dst: CGRect, in context: CGContext) {
    let whole = CGRect(x: 0, y: 0, width: image.width, height: image.height)
    guard let part = src == whole ? image : image.cropping(to: src) else { return }
    context.saveGState()
    // Core Graphics draws an image bottom up: flip it back inside its rect.
    context.translateBy(x: dst.minX, y: dst.maxY)
    context.scaleBy(x: 1, y: -1)
    context.draw(part, in: CGRect(x: 0, y: 0, width: dst.width, height: dst.height))
    context.restoreGState()
  }

  private static func rect(_ value: Any?) -> CGRect? {
    guard let v = value as? [Double], v.count == 4 else { return nil }
    return CGRect(x: v[0], y: v[1], width: v[2] - v[0], height: v[3] - v[1])
  }
}

private struct GraphicsError: Error {
  let message: String
  init(_ message: String) { self.message = message }
}
