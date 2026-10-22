package anipoex.runtime

import eu.kanade.tachiyomi.source.model.Page
import eu.kanade.tachiyomi.source.online.HttpSource
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.nio.file.Files
import java.nio.file.StandardCopyOption
import java.security.MessageDigest

/**
 * Reader pages fetched as Mihon's reader fetches them, through the source's own client, so its interceptors run
 * (descramblers, rate limits, cookies); each lands in a file the app shows. The newest [limit] are kept.
 */
class PageCache(private val dir: File, private val limit: Int = 500) {
    /**
     * Returns the page's `file://` URI and the Content-Type the site gave it: null when it gave none, or when the page
     * was already here (a reader scrolling back asks again), which is read again instead of downloaded.
     */
    suspend fun fetch(source: HttpSource, imageUrl: String, index: Int): Map<String, Any?> = withContext(Dispatchers.IO) {
        val name = MessageDigest.getInstance("SHA-256").digest(imageUrl.toByteArray()).joinToString("") { "%02x".format(it) }
        val file = File(dir, name)
        // Touched so the pages being read stay among the newest.
        if (file.setLastModified(System.currentTimeMillis())) return@withContext mapOf("uri" to file.toPath().toUri().toString(), "type" to null)
        source.getImage(Page(index, imageUrl = imageUrl)).use { response ->
            dir.mkdirs()
            // Written aside and moved in, so a reader never shows half a page.
            val partial = File.createTempFile(name, ".part", dir)
            try {
                partial.outputStream().use { response.body.byteStream().copyTo(it) }
                Files.move(partial.toPath(), file.toPath(), StandardCopyOption.REPLACE_EXISTING, StandardCopyOption.ATOMIC_MOVE)
            } finally {
                partial.delete()
            }
            prune()
            val type = response.body.contentType()?.let { "${it.type}/${it.subtype}" }
            mapOf("uri" to file.toPath().toUri().toString(), "type" to type)
        }
    }

    private fun prune() {
        val pages = dir.listFiles { file -> !file.name.endsWith(".part") }.orEmpty()
        if (pages.size <= limit) return
        pages.sortedByDescending { it.lastModified() }.drop(limit).forEach { it.delete() }
    }
}
