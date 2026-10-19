package okhttp3.zstd

import okhttp3.CompressionInterceptor
import okio.BufferedSource
import okio.Source

// shortcut: sin zstd en iOS (zstd-kmp es JNI); un decodificador Java puro si un servidor exige zstd
object Zstd : CompressionInterceptor.DecompressionAlgorithm {
    override val encoding: String = "identity"

    override fun decompress(compressedSource: BufferedSource): Source = compressedSource
}
