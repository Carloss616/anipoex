package expo.modules.extensionruntime

import android.app.Application
import android.content.pm.PackageInfo
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.drawable.AdaptiveIconDrawable
import android.graphics.drawable.Drawable
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.util.Log
import dalvik.system.DelegateLastClassLoader
import dalvik.system.PathClassLoader
import eu.kanade.tachiyomi.network.GET
import eu.kanade.tachiyomi.network.NetworkHelper
import eu.kanade.tachiyomi.network.awaitSuccess
import eu.kanade.tachiyomi.source.CatalogueSource
import eu.kanade.tachiyomi.source.Source
import eu.kanade.tachiyomi.source.SourceFactory
import eu.kanade.tachiyomi.source.model.MangasPage
import eu.kanade.tachiyomi.source.model.Page
import eu.kanade.tachiyomi.source.model.SChapter
import eu.kanade.tachiyomi.source.model.SManga
import eu.kanade.tachiyomi.source.online.HttpSource
import expo.modules.kotlin.functions.Coroutine
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.ExperimentalSerializationApi
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.protobuf.ProtoBuf
import uy.kohesive.injekt.Injekt
import uy.kohesive.injekt.api.addSingleton
import uy.kohesive.injekt.api.get
import java.io.File
import java.security.MessageDigest
import java.util.concurrent.ConcurrentHashMap

private val SUPPORTED_LIBS = setOf(1.4f, 1.6f)
private const val ICON_SIZE = 96
// Bumped when the extraction changes, so icons written by an older one are redrawn on the next load.
private const val ICON_FILE = ".v2.png"

/**
 * Installs and loads extension APKs: metadata, supported libs, class loader and signatures.
 * @see https://github.com/mihonapp/mihon/blob/main/app/src/main/java/eu/kanade/tachiyomi/extension/util/ExtensionLoader.kt
 */
class ExtensionRuntimeModule : Module() {
  private val app get() = requireNotNull(appContext.reactContext).applicationContext as Application
  private val extensionsDir get() = File(app.filesDir, "exts")
  private val sources = ConcurrentHashMap<Long, CatalogueSource>()
  private val extensions = ConcurrentHashMap<String, Map<String, Any?>>()
  private val lock = Any()

  @OptIn(ExperimentalSerializationApi::class)
  override fun definition() = ModuleDefinition {
    Name("ExtensionRuntime")

    // What extensions pull from Injekt: extensions read these four.
    OnCreate {
      Injekt.addSingleton<Application>(app)
      Injekt.addSingleton(NetworkHelper(app))
      Injekt.addSingleton<Json>(Json { ignoreUnknownKeys = true; explicitNulls = false })
      Injekt.addSingleton<ProtoBuf>(ProtoBuf)
    }

    AsyncFunction("install") Coroutine { apkUrl: String, signingKey: String ->
      withContext(Dispatchers.IO) { install(apkUrl, signingKey) }
    }

    AsyncFunction("installed") Coroutine { ->
      withContext(Dispatchers.IO) { loadStored().values.toList() }
    }

    AsyncFunction("uninstall") Coroutine { pkg: String ->
      withContext(Dispatchers.IO) { uninstall(pkg) }
    }

    // On IO: 1.4 sources answer through Rx, which runs the HTTP call blocking on the subscribing thread.
    AsyncFunction("popular") Coroutine { sourceId: String, page: Int ->
      withContext(Dispatchers.IO) { source(sourceId).getPopularManga(page).toMap() }
    }

    AsyncFunction("search") Coroutine { sourceId: String, query: String, page: Int ->
      withContext(Dispatchers.IO) {
        val source = source(sourceId)
        source.getSearchManga(page, query, source.getFilterList()).toMap()
      }
    }

    AsyncFunction("chapters") Coroutine { sourceId: String, mangaUrl: String, title: String ->
      withContext(Dispatchers.IO) {
        val manga = SManga.create().apply {
          url = mangaUrl
          this.title = title
        }
        // No details: the app doesn't use them, and a parsed details SManga has no url (Mihon keeps the stored one).
        val update = source(sourceId).getMangaUpdate(manga, emptyList(), fetchDetails = false, fetchChapters = true)
        mapOf("chapters" to update.chapters.map { it.toMap() })
      }
    }

    AsyncFunction("mangaWebUrl") Coroutine { sourceId: String, mangaUrl: String ->
      withContext(Dispatchers.IO) {
        // Null when the source isn't an HttpSource or can't build the url.
        try {
          val manga = SManga.create().apply {
            url = mangaUrl
            title = ""
          }
          (source(sourceId) as? HttpSource)?.getMangaUrl(manga)
        } catch (e: CancellationException) {
          throw e
        } catch (e: Throwable) {
          null
        }
      }
    }

    AsyncFunction("pages") Coroutine { sourceId: String, chapterUrl: String, memo: String? ->
      withContext(Dispatchers.IO) {
        val source = source(sourceId) as HttpSource
        val chapter = SChapter.create().apply {
          url = chapterUrl
          name = ""
          if (memo != null) this.memo = Json.parseToJsonElement(memo).jsonObject
        }
        // shortcut: hands JS the url and headers; a source that rewrites images in client interceptors needs the module to fetch them itself.
        source.getPageList(chapter).map { page ->
          if (page.imageUrl == null) page.imageUrl = source.getImageUrl(page)
          val request = source.hostImageRequest(page)
          mapOf("index" to page.index, "imageUrl" to request.url.toString(), "headers" to request.headers.toMap())
        }
      }
    }
  }

  private suspend fun install(apkUrl: String, signingKey: String): Map<String, Any?> {
    extensionsDir.mkdirs()
    val download = File.createTempFile("download", ".apk", extensionsDir)
    try {
      Injekt.get<NetworkHelper>().client.newCall(GET(apkUrl)).awaitSuccess().use { response ->
        download.outputStream().use { response.body.byteStream().copyTo(it) }
      }
      val info = packageInfo(download) ?: error("$apkUrl isn't an APK")
      // Loading runs the extension's code inside the app, so only the repo's key gets that far.
      check(signingKey.lowercase() in signatures(info)) { "${info.packageName} isn't signed by the repo key" }
      metadata(info, download)
      val target = File(extensionsDir, "${info.packageName}.ext")
      val backup = File(extensionsDir, "${info.packageName}.bak")
      // Concurrent installs of one package take turns replacing and loading its file.
      return synchronized(lock) {
        backup.delete()
        val hadPrevious = target.renameTo(backup)
        try {
          check(download.renameTo(target)) { "Couldn't store ${info.packageName}" }
          // Android 14+ refuses to load code from a writable file.
          target.setReadOnly()
          load(target, overwriteIcon = true).also { backup.delete() }
        } catch (e: Throwable) {
          // The previous version stays installed when the new one can't be stored or loaded.
          target.setWritable(true)
          target.delete()
          if (hadPrevious) backup.renameTo(target)
          throw e
        }
      }
    } finally {
      download.delete()
    }
  }

  private fun applicationInfo(info: PackageInfo, apk: File) = requireNotNull(info.applicationInfo).apply {
    sourceDir = apk.path
    publicSourceDir = apk.path
  }

  private fun metadata(info: PackageInfo, apk: File): Bundle {
    val appInfo = applicationInfo(info, apk)
    val meta = requireNotNull(appInfo.metaData) { "${info.packageName} has no extension metadata" }
    val lib = libVersion(info, meta)
    check(lib in SUPPORTED_LIBS) { "${info.packageName} targets extensions-lib $lib, only ${SUPPORTED_LIBS.joinToString()} are supported" }
    return meta
  }

  // Like Mihon: an extension without the lib in its metadata carries it in versionName (1.4.3 -> 1.4).
  private fun libVersion(info: PackageInfo, meta: Bundle): Float =
    meta.getFloat("tachiyomix.extensionLib").takeUnless { it == 0f }
      ?: info.versionName.orEmpty().substringBeforeLast('.').toFloatOrNull()
      ?: 0f

  // The APK's launcher icon as a PNG next to it; null when it can't be read, so a bad icon never fails a load.
  private fun icon(info: PackageInfo, apk: File, overwrite: Boolean): String? {
    val png = File(extensionsDir, info.packageName + ICON_FILE)
    return try {
      if (overwrite || !png.exists()) {
        File(extensionsDir, "${info.packageName}.png").delete()
        val drawable = app.packageManager.getApplicationIcon(applicationInfo(info, apk))
        png.outputStream().use { toBitmap(drawable).compress(Bitmap.CompressFormat.PNG, 100, it) }
      }
      Uri.fromFile(png).toString()
    } catch (e: Throwable) {
      Log.w("ExtensionRuntime", "No icon for ${info.packageName}", e)
      png.delete()
      null
    }
  }

  // The icon edge to edge: tiles clip their own shape, so the launcher's mask and padding would show as a frame.
  private fun toBitmap(drawable: Drawable): Bitmap {
    val width = if (drawable.intrinsicWidth > 0) drawable.intrinsicWidth else ICON_SIZE
    val height = if (drawable.intrinsicHeight > 0) drawable.intrinsicHeight else ICON_SIZE
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && drawable is AdaptiveIconDrawable) {
      // Unmasked layers, scaled so the 72dp safe zone of the 108dp canvas fills the bitmap like a maskless launcher.
      val side = width * 2 / 3
      return Bitmap.createBitmap(side, side, Bitmap.Config.ARGB_8888).also { bitmap ->
        listOfNotNull(drawable.background, drawable.foreground).forEach {
          it.setBounds(-side / 4, -side / 4, side + side / 4, side + side / 4)
          it.draw(Canvas(bitmap))
        }
      }
    }
    val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888).also {
      drawable.setBounds(0, 0, width, height)
      drawable.draw(Canvas(it))
    }
    return opaqueCrop(bitmap)
  }

  // Legacy icons draw their shape inside a transparent margin with a soft shadow; keeps only the fully opaque body.
  private fun opaqueCrop(bitmap: Bitmap): Bitmap {
    val pixels = IntArray(bitmap.width * bitmap.height)
    bitmap.getPixels(pixels, 0, bitmap.width, 0, 0, bitmap.width, bitmap.height)
    var left = bitmap.width; var top = bitmap.height; var right = -1; var bottom = -1
    pixels.forEachIndexed { i, pixel ->
      if (pixel ushr 24 == 0xFF) {
        left = minOf(left, i % bitmap.width)
        right = maxOf(right, i % bitmap.width)
        top = minOf(top, i / bitmap.width)
        bottom = maxOf(bottom, i / bitmap.width)
      }
    }
    // Nothing fully opaque (a translucent or empty icon): kept as drawn.
    if (right < 0) return bitmap
    return Bitmap.createBitmap(bitmap, left, top, right - left + 1, bottom - top + 1)
  }

  private fun load(apk: File, overwriteIcon: Boolean = false): Map<String, Any?> {
    val info = packageInfo(apk) ?: error("${apk.name} isn't an APK")
    val meta = metadata(info, apk)

    val parent = app.classLoader
    val loader = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
      DelegateLastClassLoader(apk.path, null, parent)
    } else {
      PathClassLoader(apk.path, parent)
    }
    val loaded = requireNotNull(meta.getString("tachiyomi.extension.class")).split(";").flatMap {
      val name = it.trim().let { cls -> if (cls.startsWith(".")) info.packageName + cls else cls }
      when (val instance = Class.forName(name, false, loader).getDeclaredConstructor().newInstance()) {
        is Source -> listOf(instance)
        is SourceFactory -> instance.createSources()
        else -> error("Unknown source class ${instance.javaClass}")
      }
    }.filterIsInstance<CatalogueSource>()
    // Drops what a previous version registered, so ids it had and this one dropped stop resolving.
    unregister(info.packageName)
    loaded.forEach { sources[it.id] = it }

    val extension = mapOf(
      "pkg" to info.packageName,
      "name" to name(info, apk, meta),
      "version" to info.versionName.orEmpty(),
      // Via string so 1.6f reaches JS as 1.6, not 1.600000023841858.
      "lib" to libVersion(info, meta).toString().toDouble(),
      "signingKey" to signatures(info).firstOrNull().orEmpty(),
      "icon" to icon(info, apk, overwriteIcon),
      "sources" to loaded.map {
        // Some extensions throw here (an unset baseUrl); no website then.
        val homeUrl = runCatching { (it as? HttpSource)?.getHomeUrl() }.getOrNull()
        mapOf("id" to it.id.toString(), "name" to it.name, "lang" to it.lang, "homeUrl" to homeUrl)
      },
    )
    extensions[info.packageName] = extension
    return extension
  }

  // Like Mihon: builds without tachiyomix.name are named by their app label, else the package.
  private fun name(info: PackageInfo, apk: File, meta: Bundle): String =
    meta.getString("tachiyomix.name")
      ?: app.packageManager.getApplicationLabel(applicationInfo(info, apk)).toString()
        .substringAfter("Tachiyomi: ").ifBlank { null }
      ?: info.packageName

  // Extensions live in memory: after a restart, the first call reloads the stored ones.
  private fun loadStored(): Map<String, Map<String, Any?>> = synchronized(lock) {
    extensionsDir.listFiles { file -> file.extension == "ext" }?.forEach {
      if (!extensions.containsKey(it.nameWithoutExtension)) {
        // A file that fails to load is skipped so it can't hide the others.
        try { load(it) } catch (e: Throwable) { Log.w("ExtensionRuntime", "Skipping ${it.name}", e) }
      }
    }
    extensions
  }

  private fun source(id: String): CatalogueSource {
    val key = id.toLong()
    return sources[key] ?: run { loadStored(); sources[key] } ?: error("Source $id isn't installed")
  }

  private fun unregister(pkg: String) {
    extensions.remove(pkg)?.let { extension ->
      (extension["sources"] as List<*>).forEach { sources.remove((it as Map<*, *>)["id"].toString().toLong()) }
    }
  }

  private fun uninstall(pkg: String) = synchronized(lock) {
    // The package names a file in extensionsDir, so it must not reach outside it.
    require(pkg.isNotEmpty() && '/' !in pkg && pkg != "." && pkg != "..") { "Invalid package name" }
    unregister(pkg)
    val file = File(extensionsDir, "$pkg.ext")
    file.setWritable(true)
    file.delete()
    File(extensionsDir, pkg + ICON_FILE).delete()
    Unit
  }

  @Suppress("DEPRECATION")
  private fun packageInfo(apk: File): PackageInfo? = app.packageManager.getPackageArchiveInfo(
    apk.path,
    PackageManager.GET_META_DATA or
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) PackageManager.GET_SIGNING_CERTIFICATES else PackageManager.GET_SIGNATURES,
  )

  // Same digest as Mihon and the repo index: SHA-256 of each signing certificate, in hex.
  @Suppress("DEPRECATION")
  private fun signatures(info: PackageInfo): List<String> {
    val signers = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
      info.signingInfo?.apkContentsSigners
    } else {
      info.signatures
    }
    return signers.orEmpty().map { signer ->
      MessageDigest.getInstance("SHA-256").digest(signer.toByteArray()).joinToString("") { "%02x".format(it) }
    }
  }
}

private fun MangasPage.toMap() = mapOf("mangas" to mangas.map { it.toMap() }, "hasNextPage" to hasNextPage)

private fun SManga.toMap() = mapOf(
  "url" to url,
  "title" to title,
  "thumbnailUrl" to thumbnail_url,
  "author" to author,
  "artist" to artist,
  "description" to description,
  "genre" to genre,
  "status" to status,
)

private fun SChapter.toMap() = mapOf(
  "url" to url,
  "name" to name,
  "number" to chapter_number,
  "scanlator" to scanlator,
  "dateUpload" to date_upload,
  // Opaque to the app: lib 1.6 sources read it back in getPageList; null when the source keeps none.
  "memo" to memo.takeIf { it.isNotEmpty() }?.toString(),
)
