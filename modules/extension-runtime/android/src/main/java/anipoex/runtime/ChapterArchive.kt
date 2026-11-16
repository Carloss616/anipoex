package anipoex.runtime

import java.io.File
import java.io.InputStream
import java.nio.file.Files
import java.nio.file.StandardCopyOption
import java.util.zip.CRC32
import java.util.zip.ZipEntry
import java.util.zip.ZipInputStream
import java.util.zip.ZipOutputStream

/** A chapter as one CBZ: pages are staged as files, packed, and unpacked for reading. */
object ChapterArchive {
    private const val COMIC_INFO = "ComicInfo.xml"
    private val ID = Regex("^[A-Za-z0-9-]{1,200}$")
    private val TOKEN = Regex("\\d+|\\D+")

    fun extension(type: String?, head: ByteArray): String {
        when (type?.lowercase()) {
            "image/jpeg" -> return "jpg"
            "image/png" -> return "png"
            "image/webp" -> return "webp"
            "image/gif" -> return "gif"
            "image/avif" -> return "avif"
        }
        fun at(offset: Int, text: String) = head.size >= offset + text.length &&
            text.indices.all { head[offset + it] == text[it].code.toByte() }
        return when {
            head.size >= 3 && head[0] == 0xFF.toByte() && head[1] == 0xD8.toByte() && head[2] == 0xFF.toByte() -> "jpg"
            head.size >= 4 && head[0] == 0x89.toByte() && at(1, "PNG") -> "png"
            at(0, "RIFF") && at(8, "WEBP") -> "webp"
            at(0, "GIF8") -> "gif"
            at(4, "ftypavif") -> "avif"
            else -> "jpg"
        }
    }

    fun stage(page: File, type: String?, stage: File, name: String): File {
        val head = page.inputStream().use { input ->
            ByteArray(16).let { it.copyOf(input.read(it).coerceAtLeast(0)) }
        }
        stage.mkdirs()
        val target = File(stage, "$name.${extension(type, head)}")
        Files.copy(page.toPath(), target.toPath(), StandardCopyOption.REPLACE_EXISTING)
        return target
    }

    fun pack(stage: File, comicInfo: String, dest: File) {
        val parent = dest.absoluteFile.parentFile
        parent.mkdirs()
        // Written aside and moved in, so a reader never opens half a chapter.
        val partial = File.createTempFile(dest.name, ".part", parent)
        try {
            ZipOutputStream(partial.outputStream().buffered()).use { zip ->
                for (file in stage.listFiles().orEmpty().filter { it.isFile }.sortedBy { it.name }) {
                    // STORED needs size and CRC before the data is written.
                    val crc = CRC32()
                    file.inputStream().use { input ->
                        val buffer = ByteArray(8192)
                        while (true) {
                            val n = input.read(buffer)
                            if (n < 0) break
                            crc.update(buffer, 0, n)
                        }
                    }
                    zip.putNextEntry(ZipEntry(file.name).apply {
                        method = ZipEntry.STORED
                        size = file.length()
                        compressedSize = file.length()
                        this.crc = crc.value
                    })
                    file.inputStream().use { it.copyTo(zip) }
                    zip.closeEntry()
                }
                zip.putNextEntry(ZipEntry(COMIC_INFO))
                zip.write(comicInfo.toByteArray(Charsets.UTF_8))
                zip.closeEntry()
            }
            Files.move(partial.toPath(), dest.toPath(), StandardCopyOption.REPLACE_EXISTING, StandardCopyOption.ATOMIC_MOVE)
        } finally {
            partial.delete()
        }
        stage.deleteRecursively()
    }

    fun unpack(cbz: InputStream, dir: File): List<File> {
        dir.deleteRecursively()
        dir.mkdirs()
        val root = dir.canonicalPath + File.separator
        val files = mutableListOf<File>()
        ZipInputStream(cbz).use { zip ->
            while (true) {
                val entry = zip.nextEntry ?: break
                // Pages are flat, so any path separator is not a page.
                if (entry.isDirectory || entry.name == COMIC_INFO || '/' in entry.name || '\\' in entry.name) continue
                val file = File(dir, entry.name)
                if (!file.canonicalPath.startsWith(root)) continue
                file.outputStream().use { zip.copyTo(it) }
                files += file
            }
        }
        return files.sortedWith { a, b -> naturalCompare(a.name, b.name) }
    }

    fun prune(parent: File, keep: Int) {
        parent.listFiles { f -> f.isDirectory }.orEmpty()
            .sortedByDescending { it.lastModified() }
            .drop(keep)
            .forEach { it.deleteRecursively() }
    }

    fun checkId(id: String): String {
        require(ID.matches(id)) { "Bad id" }
        return id
    }

    private fun naturalCompare(a: String, b: String): Int {
        val ta = TOKEN.findAll(a).map { it.value }.toList()
        val tb = TOKEN.findAll(b).map { it.value }.toList()
        for ((x, y) in ta.zip(tb)) {
            val numeric = x[0].isDigit() && y[0].isDigit()
            val c = if (numeric) {
                // Longer digit run (after trimming zeros) is bigger; equal lengths compare as text.
                val nx = x.trimStart('0')
                val ny = y.trimStart('0')
                if (nx.length != ny.length) nx.length.compareTo(ny.length) else nx.compareTo(ny)
            } else x.compareTo(y)
            if (c != 0) return c
        }
        return ta.size.compareTo(tb.size).let { if (it != 0) it else a.compareTo(b) }
    }
}
