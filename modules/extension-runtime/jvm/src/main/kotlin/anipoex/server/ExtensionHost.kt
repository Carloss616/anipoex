package anipoex.server

import android.app.Application
import eu.kanade.tachiyomi.network.GET
import eu.kanade.tachiyomi.network.NetworkHelper
import eu.kanade.tachiyomi.network.awaitSuccess
import eu.kanade.tachiyomi.source.CatalogueSource
import eu.kanade.tachiyomi.source.Source
import eu.kanade.tachiyomi.source.SourceFactory
import eu.kanade.tachiyomi.source.model.MangasPage
import eu.kanade.tachiyomi.source.model.SChapter
import eu.kanade.tachiyomi.source.model.SManga
import eu.kanade.tachiyomi.source.online.HttpSource
import kotlinx.coroutines.CancellationException
import kotlinx.serialization.ExperimentalSerializationApi
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.protobuf.ProtoBuf
import uy.kohesive.injekt.Injekt
import uy.kohesive.injekt.api.addSingleton
import uy.kohesive.injekt.api.get
import java.io.File
import java.net.URLClassLoader
import java.util.concurrent.ConcurrentHashMap

private val SUPPORTED_LIBS = setOf(1.4f, 1.6f)

/**
 * The JVM side of ExtensionRuntimeModule: installs APKs as jars and answers the same calls.
 * @see https://github.com/mihonapp/mihon/blob/main/app/src/main/java/eu/kanade/tachiyomi/extension/util/ExtensionLoader.kt
 */
@OptIn(ExperimentalSerializationApi::class)
class ExtensionHost(dataDir: File) {
    private val extensionsDir = File(dataDir, "exts")
    private val sources = ConcurrentHashMap<Long, CatalogueSource>()
    private val extensions = ConcurrentHashMap<String, Map<String, Any?>>()
    private val lock = Any()

    init {
        recoverInterruptedInstalls()
        val app = Application(dataDir, "1.0.0", 1)
        Injekt.addSingleton<Application>(app)
        Injekt.addSingleton(NetworkHelper(app))
        Injekt.addSingleton<Json>(Json { ignoreUnknownKeys = true; explicitNulls = false })
        Injekt.addSingleton<ProtoBuf>(ProtoBuf)
    }

    suspend fun install(apkUrl: String, signingKey: String): Map<String, Any?> {
        extensionsDir.mkdirs()
        val download = File.createTempFile("download", ".apk", extensionsDir)
        val converted = File.createTempFile("convert", ".jar", extensionsDir)
        try {
            val started = System.nanoTime()
            Injekt.get<NetworkHelper>().client.newCall(GET(apkUrl)).awaitSuccess().use { response ->
                download.outputStream().use { response.body.byteStream().copyTo(it) }
            }
            val downloaded = System.nanoTime()
            val apk = readApk(download)
            // Loading runs the extension's code in the server, so only the repo's key gets that far.
            check(signingKey.lowercase() in apk.signers) { "${apk.packageName} isn't signed by the repo key" }
            val lib = libVersion(apk.versionName, apk.metaData)
            check(lib in SUPPORTED_LIBS) { "${apk.packageName} targets extensions-lib $lib, only ${SUPPORTED_LIBS.joinToString()} are supported" }
            val verified = System.nanoTime()
            dexToJar(download, converted)
            val translated = System.nanoTime()
            val meta = JsonObject(
                buildMap {
                    put("pkg", JsonPrimitive(apk.packageName))
                    put("version", JsonPrimitive(apk.versionName.orEmpty()))
                    put("lib", JsonPrimitive(lib.toString()))
                    put("signingKey", JsonPrimitive(apk.signers.first()))
                    put("name", JsonPrimitive(extensionName(apk)))
                    put("classes", JsonPrimitive(requireNotNull(apk.metaData["tachiyomi.extension.class"]) { "${apk.packageName} has no extension class" }))
                    // Kept in the meta, so installed() has it after a restart without the APK.
                    apkIcon(download)?.let { put("icon", JsonPrimitive(it)) }
                },
            )
            val jar = File(extensionsDir, "${apk.packageName}.jar")
            val json = File(extensionsDir, "${apk.packageName}.json")
            val backups = listOf(jar, json).map { File(it.path + ".bak") }
            // Concurrent installs of one package take turns replacing and loading its files.
            return synchronized(lock) {
                backups.forEach { it.delete() }
                val hadPrevious = jar.renameTo(backups[0]) && json.renameTo(backups[1])
                try {
                    check(converted.renameTo(jar)) { "Couldn't store ${apk.packageName}" }
                    json.writeText(meta.toString())
                    load(apk.packageName).also {
                        backups.forEach { it.delete() }
                        val loaded = System.nanoTime()
                        System.err.println("install ${apk.packageName}: download ${ms(downloaded - started)} verify ${ms(verified - downloaded)} dex2jar ${ms(translated - verified)} load ${ms(loaded - translated)}")
                    }
                } catch (e: Throwable) {
                    // The previous version stays installed when the new one can't be stored or loaded.
                    jar.delete()
                    json.delete()
                    if (hadPrevious) {
                        backups[0].renameTo(jar)
                        backups[1].renameTo(json)
                    }
                    throw e
                }
            }
        } finally {
            download.delete()
            converted.delete()
        }
    }

    // A server that died mid-install leaves its temporaries, and backups that are the only copy until the new jar and meta are both stored.
    private fun recoverInterruptedInstalls() {
        val files = extensionsDir.listFiles().orEmpty()
        files.forEach {
            val name = it.name
            if ((name.startsWith("download") && name.endsWith(".apk")) || (name.startsWith("convert") && name.endsWith(".jar"))) it.delete()
            if (name.startsWith("classes") && it.isDirectory) it.deleteRecursively()
        }
        files.filter { it.name.endsWith(".bak") }.groupBy { it.name.removeSuffix(".bak").substringBeforeLast('.') }.forEach { (pkg, backups) ->
            val replaced = File(extensionsDir, "$pkg.jar").exists() && File(extensionsDir, "$pkg.json").exists()
            backups.forEach { backup ->
                val live = File(backup.path.removeSuffix(".bak"))
                if (!replaced) {
                    live.delete()
                    backup.renameTo(live)
                }
                backup.delete()
            }
        }
    }

    fun installed(): List<Map<String, Any?>> = loadStored().values.toList()

    fun uninstall(pkg: String) = synchronized(lock) {
        // The package names a file in extensionsDir, so it must not reach outside it.
        require(pkg.isNotEmpty() && '/' !in pkg && pkg != "." && pkg != "..") { "Invalid package name" }
        unregister(pkg)
        File(extensionsDir, "$pkg.jar").delete()
        File(extensionsDir, "$pkg.json").delete()
        Unit
    }

    suspend fun popular(sourceId: String, page: Int) = source(sourceId).getPopularManga(page).toMap()

    suspend fun search(sourceId: String, query: String, page: Int): Map<String, Any?> {
        val source = source(sourceId)
        return source.getSearchManga(page, query, source.getFilterList()).toMap()
    }

    suspend fun chapters(sourceId: String, mangaUrl: String, title: String): Map<String, Any?> {
        val manga = SManga.create().apply {
            url = mangaUrl
            this.title = title
        }
        // No details: the app doesn't use them, and a parsed details SManga has no url (Mihon keeps the stored one).
        val update = source(sourceId).getMangaUpdate(manga, emptyList(), fetchDetails = false, fetchChapters = true)
        return mapOf("chapters" to update.chapters.map { it.toMap() })
    }

    // Null when the source isn't an HttpSource or can't build the url.
    fun mangaWebUrl(sourceId: String, mangaUrl: String): String? = try {
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

    suspend fun pages(sourceId: String, chapterUrl: String, memo: String?): List<Map<String, Any?>> {
        val source = source(sourceId) as HttpSource
        val chapter = SChapter.create().apply {
            url = chapterUrl
            name = ""
            if (memo != null) this.memo = Json.parseToJsonElement(memo).jsonObject
        }
        return source.getPageList(chapter).map { page ->
            if (page.imageUrl == null) page.imageUrl = source.getImageUrl(page)
            val request = source.hostImageRequest(page)
            mapOf("index" to page.index, "imageUrl" to request.url.toString(), "headers" to request.headers.toMap())
        }
    }

    // Like Mihon: an extension without the lib in its metadata carries it in versionName (1.4.3 -> 1.4).
    private fun libVersion(versionName: String?, metaData: Map<String, String>): Float =
        metaData["tachiyomix.extensionLib"]?.toFloatOrNull()
            ?: versionName.orEmpty().substringBeforeLast('.').toFloatOrNull()
            ?: 0f

    private fun load(pkg: String): Map<String, Any?> {
        val meta = Json.parseToJsonElement(File(extensionsDir, "$pkg.json").readText()).jsonObject.mapValues { it.value.jsonPrimitive.content }
        val loader = DelegateLastClassLoader(File(extensionsDir, "$pkg.jar"), javaClass.classLoader)
        val loaded = meta.getValue("classes").split(";").flatMap {
            val name = it.trim().let { cls -> if (cls.startsWith(".")) pkg + cls else cls }
            when (val instance = Class.forName(name, false, loader).getDeclaredConstructor().newInstance()) {
                is Source -> listOf(instance)
                is SourceFactory -> instance.createSources()
                else -> error("Unknown source class ${instance.javaClass}")
            }
        }.filterIsInstance<CatalogueSource>()
        // Drops what a previous version registered, so ids it had and this one dropped stop resolving.
        unregister(pkg)
        loaded.forEach { sources[it.id] = it }

        val extension = mapOf(
            "pkg" to pkg,
            "name" to meta.getValue("name"),
            "version" to meta.getValue("version"),
            "lib" to meta.getValue("lib").toDouble(),
            "signingKey" to meta.getValue("signingKey"),
            "icon" to meta["icon"],
            "sources" to loaded.map {
                // Some extensions throw here (an unset baseUrl); no website then.
                val homeUrl = runCatching { (it as? HttpSource)?.getHomeUrl() }.getOrNull()
                mapOf("id" to it.id.toString(), "name" to it.name, "lang" to it.lang, "homeUrl" to homeUrl)
            },
        )
        extensions[pkg] = extension
        return extension
    }

    // Extensions live in memory: after a restart, the first call reloads the stored ones.
    private fun loadStored(): Map<String, Map<String, Any?>> = synchronized(lock) {
        extensionsDir.listFiles { file -> file.extension == "json" }?.forEach {
            if (!extensions.containsKey(it.nameWithoutExtension)) {
                // A file that fails to load is skipped so it can't hide the others.
                try { load(it.nameWithoutExtension) } catch (e: Throwable) { System.err.println("Skipping ${it.name}: $e") }
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
}

/** Android's DelegateLastClassLoader on the JVM: the platform first, then the extension's jar, then the host. */
private class DelegateLastClassLoader(jar: File, parent: ClassLoader) : URLClassLoader(arrayOf(jar.toURI().toURL()), parent) {
    override fun loadClass(name: String, resolve: Boolean): Class<*> = synchronized(getClassLoadingLock(name)) {
        findLoadedClass(name)
            ?: tryLoad { getPlatformClassLoader().loadClass(name) }
            ?: tryLoad { findClass(name) }
            ?: super.loadClass(name, resolve)
    }

    private fun tryLoad(load: () -> Class<*>): Class<*>? = try { load() } catch (e: ClassNotFoundException) { null }
}

// Like Android's host: the metadata name, else the app label without Mihon's prefix, else the package.
internal fun extensionName(apk: ApkInfo): String =
    apk.metaData["tachiyomix.name"] ?: apk.label?.substringAfter("Tachiyomi: ")?.ifBlank { null } ?: apk.packageName

private fun ms(nanos: Long) = "${nanos / 1_000_000} ms"

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
