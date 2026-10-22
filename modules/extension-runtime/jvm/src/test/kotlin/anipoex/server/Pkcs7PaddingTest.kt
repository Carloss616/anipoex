package anipoex.server

import javax.crypto.Cipher
import javax.crypto.spec.IvParameterSpec
import javax.crypto.spec.SecretKeySpec
import kotlin.test.Test
import kotlin.test.assertContentEquals
import kotlin.test.assertEquals

class Pkcs7PaddingTest {
    private val secret = SecretKeySpec(ByteArray(32) { it.toByte() }, "AES")
    private val vector = IvParameterSpec(ByteArray(16) { (it * 3).toByte() })

    @Test
    fun androidsPaddingNameWorksAndMatchesPkcs5() {
        Pkcs7Padding.install()
        val plain = "chapters: [1, 2, 3]".toByteArray()
        // The extension's spelling, as Android takes it.
        val encrypt = Cipher.getInstance("AES/CBC/PKCS7PADDING").apply { init(Cipher.ENCRYPT_MODE, secret, vector) }
        val sealed = encrypt.doFinal(plain)
        val reference = Cipher.getInstance("AES/CBC/PKCS5Padding").apply { init(Cipher.ENCRYPT_MODE, secret, vector) }.doFinal(plain)
        assertContentEquals(reference, sealed)
        val decrypt = Cipher.getInstance("AES/CBC/PKCS7Padding").apply { init(Cipher.DECRYPT_MODE, secret, vector) }
        assertEquals("chapters: [1, 2, 3]", String(decrypt.doFinal(sealed)))
    }
}
