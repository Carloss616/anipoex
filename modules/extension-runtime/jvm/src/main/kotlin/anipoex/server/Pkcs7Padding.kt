package anipoex.server

import java.security.AlgorithmParameters
import java.security.Key
import java.security.Provider
import java.security.SecureRandom
import java.security.Security
import java.security.spec.AlgorithmParameterSpec
import javax.crypto.Cipher
import javax.crypto.CipherSpi

/**
 * Android's cipher providers take "PKCS7Padding" (the extensions' AES helper asks for `AES/CBC/PKCS7PADDING`),
 * the JVM's only "PKCS5Padding": for a 16-byte block the two pad alike, so AES under that name runs
 * the JVM's own PKCS5 cipher.
 */
object Pkcs7Padding {
    fun install() {
        if (Security.getProvider(NAME) == null) Security.addProvider(Pkcs7Provider())
    }

    private const val NAME = "AnipoexPkcs7"

    private class Pkcs7Provider : Provider(NAME, "1.0", "AES with Android's PKCS7Padding name") {
        init {
            putService(
                Service(this, "Cipher", "AES", Pkcs7Cipher::class.java.name, null, mapOf("SupportedPaddings" to "PKCS7PADDING")),
            )
        }
    }

    class Pkcs7Cipher : CipherSpi() {
        private var mode = "ECB"
        private lateinit var cipher: Cipher

        override fun engineSetMode(mode: String) {
            this.mode = mode
        }

        override fun engineSetPadding(padding: String) {
            if (!padding.equals("PKCS7Padding", ignoreCase = true)) throw javax.crypto.NoSuchPaddingException(padding)
        }

        private fun open(opmode: Int, init: Cipher.() -> Unit) {
            cipher = Cipher.getInstance("AES/$mode/PKCS5Padding").apply(init)
        }

        override fun engineInit(opmode: Int, key: Key, random: SecureRandom?) = open(opmode) { init(opmode, key, random) }

        override fun engineInit(opmode: Int, key: Key, params: AlgorithmParameterSpec?, random: SecureRandom?) =
            open(opmode) { init(opmode, key, params, random) }

        override fun engineInit(opmode: Int, key: Key, params: AlgorithmParameters?, random: SecureRandom?) =
            open(opmode) { init(opmode, key, params, random) }

        override fun engineGetBlockSize() = 16

        override fun engineGetOutputSize(inputLen: Int) = cipher.getOutputSize(inputLen)

        override fun engineGetIV(): ByteArray? = if (::cipher.isInitialized) cipher.iv else null

        override fun engineGetParameters(): AlgorithmParameters? = if (::cipher.isInitialized) cipher.parameters else null

        override fun engineUpdate(input: ByteArray, offset: Int, len: Int): ByteArray? = cipher.update(input, offset, len)

        override fun engineUpdate(input: ByteArray, offset: Int, len: Int, output: ByteArray, outputOffset: Int) =
            cipher.update(input, offset, len, output, outputOffset)

        override fun engineDoFinal(input: ByteArray?, offset: Int, len: Int): ByteArray =
            cipher.doFinal(input ?: ByteArray(0), offset, len)

        override fun engineDoFinal(input: ByteArray?, offset: Int, len: Int, output: ByteArray, outputOffset: Int) =
            cipher.doFinal(input ?: ByteArray(0), offset, len, output, outputOffset)
    }
}
