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

    AsyncFunction("list") { (bookmark: String, sub: String) -> [[String: String]] in
      let dir = try self.folder(bookmark).appendingPathComponent(sub, isDirectory: true)
      let names = (try? FileManager.default.contentsOfDirectory(atPath: dir.path)) ?? []
      return names.map { entry in
        let values = try? dir.appendingPathComponent(entry)
          .resourceValues(forKeys: [.contentModificationDateKey, .fileSizeKey])
        let modified = values?.contentModificationDate?.timeIntervalSince1970 ?? 0
        // iCloud keeps a file it hasn't downloaded as `.<name>.icloud`.
        let name = entry.hasPrefix(".") && entry.hasSuffix(".icloud")
          ? String(entry.dropFirst().dropLast(".icloud".count))
          : entry
        return ["name": name, "version": "\(modified):\(values?.fileSize ?? 0)"]
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
    // Downloads: whole files under `downloads/`, copied in and out of the folder.

    AsyncFunction("listTree") { (bookmark: String, dir: String) -> [[String: Any]] in
      let root = try self.folder(bookmark)
      var out: [[String: Any]] = []
      Self.walk(root.appendingPathComponent(try checkedPath(dir, allowRoot: true), isDirectory: true),
                rel: dir, depth: 0, into: &out)
      return out
    }

    AsyncFunction("copyIn") { (bookmark: String, path: String, from: String) in
      let target = try self.folder(bookmark).appendingPathComponent(try checkedPath(path))
      let source = fileURL(from)
      let manager = FileManager.default
      try manager.createDirectory(at: target.deletingLastPathComponent(), withIntermediateDirectories: true)
      var failure: Error?
      try self.coordinate { coordinator, error in
        coordinator.coordinate(writingItemAt: target, options: .forReplacing, error: error) { url in
          // Copied beside the target and swapped in, so a failure keeps the old file.
          let temp = url.deletingLastPathComponent().appendingPathComponent(".\(UUID().uuidString).tmp")
          do {
            try manager.copyItem(at: source, to: temp)
            if manager.fileExists(atPath: url.path) {
              _ = try manager.replaceItemAt(url, withItemAt: temp)
            } else {
              try manager.moveItem(at: temp, to: url)
            }
          } catch {
            try? manager.removeItem(at: temp)
            failure = error
          }
        }
      }
      if let failure { throw folderError(failure.localizedDescription) }
    }

    AsyncFunction("copyOut") { (bookmark: String, path: String, to: String) in
      let file = try self.folder(bookmark).appendingPathComponent(try checkedPath(path))
      let destination = fileURL(to)
      let manager = FileManager.default
      let placeholder = Self.placeholder(of: file)
      guard manager.fileExists(atPath: file.path) || manager.fileExists(atPath: placeholder.path) else {
        throw notDownloaded()
      }
      if Self.needsDownload(file) {
        try? manager.startDownloadingUbiquitousItem(at: file)
        let deadline = Date().addingTimeInterval(60)
        while Self.needsDownload(file) {
          if Date() > deadline { throw notDownloaded() }
          Thread.sleep(forTimeInterval: 0.5)
        }
      }
      try manager.createDirectory(at: destination.deletingLastPathComponent(), withIntermediateDirectories: true)
      var failure: Error?
      try self.coordinate { coordinator, error in
        coordinator.coordinate(readingItemAt: file, options: [], error: error) { url in
          do {
            try? manager.removeItem(at: destination)
            try manager.copyItem(at: url, to: destination)
          } catch { failure = error }
        }
      }
      if let failure { throw folderError(failure.localizedDescription) }
    }

    AsyncFunction("removeItem") { (bookmark: String, path: String) in
      let root = try self.folder(bookmark)
      let checked = try checkedPath(path)
      let file = root.appendingPathComponent(checked)
      let manager = FileManager.default
      var isDirectory: ObjCBool = false
      var victim = file
      if !manager.fileExists(atPath: file.path, isDirectory: &isDirectory) {
        victim = Self.placeholder(of: file)
        guard manager.fileExists(atPath: victim.path, isDirectory: &isDirectory) else { return }
      }
      if isDirectory.boolValue { throw folderError("Not a file: \(path)") }
      try self.delete(victim)
      // Emptied manga and source folders go too, never `downloads/` itself.
      var parent = file.deletingLastPathComponent()
      let downloads = root.appendingPathComponent("downloads", isDirectory: true).standardizedFileURL.path
      while parent.standardizedFileURL.path != downloads,
            parent.standardizedFileURL.path.hasPrefix(downloads + "/"),
            (try? manager.contentsOfDirectory(atPath: parent.path))?.isEmpty == true {
        try self.delete(parent)
        parent = parent.deletingLastPathComponent()
      }
    }
  }

  private static func placeholder(of file: URL) -> URL {
    file.deletingLastPathComponent().appendingPathComponent(".\(file.lastPathComponent).icloud")
  }

  /// A file iCloud hasn't (fully) downloaded: a `.<name>.icloud` stub, or a stale copy.
  private static func needsDownload(_ file: URL) -> Bool {
    let manager = FileManager.default
    if !manager.fileExists(atPath: file.path) { return manager.fileExists(atPath: placeholder(of: file).path) }
    let status = try? file.resourceValues(forKeys: [.ubiquitousItemDownloadingStatusKey])
      .ubiquitousItemDownloadingStatus
    // Not an iCloud item: no status, already local.
    return status != nil && status != .current
  }

  /// Files up to `downloads/<manga>/<source>/<file>`; a folder deeper than that isn't ours.
  private static func walk(_ dir: URL, rel: String, depth: Int, into out: inout [[String: Any]]) {
    let names = (try? FileManager.default.contentsOfDirectory(atPath: dir.path)) ?? []
    for entry in names {
      let url = dir.appendingPathComponent(entry)
      if (try? url.resourceValues(forKeys: [.isDirectoryKey]).isDirectory) == true {
        if depth < 2 { walk(url, rel: "\(rel)/\(entry)", depth: depth + 1, into: &out) }
        continue
      }
      let stub = entry.hasPrefix(".") && entry.hasSuffix(".icloud")
      let name = stub ? String(entry.dropFirst().dropLast(".icloud".count)) : entry
      let real = dir.appendingPathComponent(name)
      out.append(["path": "\(rel)/\(name)", "placeholder": stub || needsDownload(real)])
    }
  }

  private func delete(_ url: URL) throws {
    var failure: Error?
    try coordinate { coordinator, error in
      coordinator.coordinate(writingItemAt: url, options: .forDeleting, error: error) { target in
        do { try FileManager.default.removeItem(at: target) } catch { failure = error }
      }
    }
    if let failure { throw folderError(failure.localizedDescription) }
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

private func notDownloaded() -> Exception {
  Exception(name: "FolderError", description: "NOT_DOWNLOADED", code: "NOT_DOWNLOADED")
}

/// A path under `downloads/`, relative and without `..`, or an error.
private func checkedPath(_ path: String, allowRoot: Bool = false) throws -> String {
  let parts = path.split(separator: "/", omittingEmptySubsequences: false)
  let inside = path == "downloads" ? allowRoot : path.hasPrefix("downloads/")
  guard inside, !path.hasPrefix("/"), !parts.contains(".."), !parts.contains(".") else {
    throw folderError("Not a downloads path: \(path)")
  }
  return path
}

/// expo-file-system hands over `file://` URIs; accept a plain path too.
private func fileURL(_ value: String) -> URL {
  value.hasPrefix("file://") ? (URL(string: value) ?? URL(fileURLWithPath: value)) : URL(fileURLWithPath: value)
}
