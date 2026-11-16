import ExpoModulesCore
import UIKit
import UniformTypeIdentifiers

/// A folder from another app (iCloud Drive, OneDrive, Google Drive) kept
/// across launches. iOS grants it to the picker only: a security-scoped
/// bookmark brings that access back, and every read and write goes through
/// NSFileCoordinator so the folder's provider downloads and uploads its files.
public class BookmarkedFolderModule: Module {
  private var picking: (picker: UIDocumentPickerViewController, delegate: PickerDelegate)?
  /// Resolved once per launch; access stays open for the app's life.
  private var folders: [String: URL] = [:]

  public func definition() -> ModuleDefinition {
    Name("BookmarkedFolder")

    AsyncFunction("pick") { (promise: Promise) in
      guard self.picking == nil,
            let current = self.appContext?.utilities?.currentViewController() else {
        promise.resolve(nil)
        return
      }
      let picker = UIDocumentPickerViewController(forOpeningContentTypes: [.folder])
      let delegate = PickerDelegate { [weak self] url in
        self?.picking = nil
        guard let url else { return promise.resolve(nil) }
        let started = url.startAccessingSecurityScopedResource()
        defer { if started { url.stopAccessingSecurityScopedResource() } }
        do {
          let bookmark = try url.bookmarkData().base64EncodedString()
          promise.resolve(["bookmark": bookmark, "name": url.lastPathComponent])
        } catch {
          promise.reject(folderError(error.localizedDescription))
        }
      }
      picker.delegate = delegate
      picker.presentationController?.delegate = delegate
      self.picking = (picker, delegate)
      current.present(picker, animated: true)
    }.runOnQueue(.main)

    AsyncFunction("list") { (bookmark: String, sub: String) -> [String] in
      let dir = try self.folder(bookmark).appendingPathComponent(sub, isDirectory: true)
      let names = (try? FileManager.default.contentsOfDirectory(atPath: dir.path)) ?? []
      // iCloud keeps a file it hasn't downloaded as `.<name>.icloud`.
      return names.map { name in
        name.hasPrefix(".") && name.hasSuffix(".icloud")
          ? String(name.dropFirst().dropLast(".icloud".count))
          : name
      }
    }

    AsyncFunction("read") { (bookmark: String, sub: String, name: String) -> String? in
      let dir = try self.folder(bookmark).appendingPathComponent(sub, isDirectory: true)
      let file = dir.appendingPathComponent(name)
      let placeholder = dir.appendingPathComponent(".\(name).icloud")
      let manager = FileManager.default
      guard manager.fileExists(atPath: file.path) || manager.fileExists(atPath: placeholder.path) else {
        return nil
      }
      // A coordinated read waits for iCloud to download the file first.
      var text: String?
      var failure: Error?
      try self.coordinate { coordinator, error in
        coordinator.coordinate(readingItemAt: file, options: [], error: error) { url in
          do { text = try String(contentsOf: url, encoding: .utf8) } catch { failure = error }
        }
      }
      if let failure { throw folderError(failure.localizedDescription) }
      return text
    }

    AsyncFunction("write") { (bookmark: String, sub: String, files: [String: String]) in
      let dir = try self.folder(bookmark).appendingPathComponent(sub, isDirectory: true)
      try FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
      for (name, text) in files {
        var failure: Error?
        try self.coordinate { coordinator, error in
          coordinator.coordinate(
            writingItemAt: dir.appendingPathComponent(name), options: .forReplacing, error: error
          ) { url in
            do { try text.write(to: url, atomically: true, encoding: .utf8) } catch { failure = error }
          }
        }
        if let failure { throw folderError(failure.localizedDescription) }
      }
    }

    AsyncFunction("remove") { (bookmark: String, sub: String, names: [String]) in
      let dir = try self.folder(bookmark).appendingPathComponent(sub, isDirectory: true)
      for name in names {
        let file = dir.appendingPathComponent(name)
        guard FileManager.default.fileExists(atPath: file.path) else { continue }
        var failure: Error?
        try self.coordinate { coordinator, error in
          coordinator.coordinate(writingItemAt: file, options: .forDeleting, error: error) { url in
            do { try FileManager.default.removeItem(at: url) } catch { failure = error }
          }
        }
        if let failure { throw folderError(failure.localizedDescription) }
      }
    }
  }

  private func folder(_ bookmark: String) throws -> URL {
    if let url = folders[bookmark] { return url }
    guard let data = Data(base64Encoded: bookmark) else { throw folderError("Not a folder bookmark") }
    var stale = false
    // shortcut: a stale bookmark still resolves but isn't refreshed; pick the
    // folder again if iOS ever stops resolving it.
    let url = try URL(resolvingBookmarkData: data, bookmarkDataIsStale: &stale)
    guard url.startAccessingSecurityScopedResource() else {
      throw folderError("The folder can't be opened anymore: choose it again")
    }
    folders[bookmark] = url
    return url
  }

  private func coordinate(_ body: (NSFileCoordinator, NSErrorPointer) -> Void) throws {
    var error: NSError?
    body(NSFileCoordinator(), &error)
    if let error { throw folderError(error.localizedDescription) }
  }
}

private final class PickerDelegate: NSObject, UIDocumentPickerDelegate, UIAdaptivePresentationControllerDelegate {
  private let done: (URL?) -> Void

  init(done: @escaping (URL?) -> Void) {
    self.done = done
  }

  func documentPicker(_ controller: UIDocumentPickerViewController, didPickDocumentsAt urls: [URL]) {
    done(urls.first)
  }

  func documentPickerWasCancelled(_ controller: UIDocumentPickerViewController) {
    done(nil)
  }

  // Swiped down: no cancel callback comes, so the promise would never settle.
  func presentationControllerDidDismiss(_ presentationController: UIPresentationController) {
    done(nil)
  }
}

private func folderError(_ message: String) -> Exception {
  Exception(name: "FolderError", description: message, code: "ERR_FOLDER")
}
