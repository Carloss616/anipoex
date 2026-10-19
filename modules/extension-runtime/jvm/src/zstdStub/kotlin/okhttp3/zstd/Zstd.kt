package okhttp3.zstd

import okhttp3.CompressionInterceptor
import okio.BufferedSource
import okio.Source

// shortcut: no zstd on iOS (zstd-kmp is JNI); add a pure-Java decoder if a server requires zstd
object Zstd : CompressionInterceptor.DecompressionAlgorithm {
    override val encoding: String = "identity"

    override fun decompress(compressedSource: BufferedSource): Source = compressedSource
}
