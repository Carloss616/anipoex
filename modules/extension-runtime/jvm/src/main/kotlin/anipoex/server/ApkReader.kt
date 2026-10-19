package anipoex.server

import com.android.apksig.ApkVerifier
import com.android.apksig.internal.apk.AndroidBinXmlParser
import java.io.File
import java.nio.ByteBuffer
import java.security.MessageDigest
import java.util.zip.ZipFile

/** What the host needs from an extension APK, read without Android's PackageManager. */
class ApkInfo(val packageName: String, val versionName: String?, val metaData: Map<String, String>, val signers: List<String>)

/** Verifies the APK's signature (v1-v3) and reads its manifest; throws when the signature doesn't verify. */
fun readApk(apk: File): ApkInfo {
    val result = ApkVerifier.Builder(apk).build().verify()
    check(result.isVerified) { "${apk.name}'s signature doesn't verify: ${result.allErrors.joinToString()}" }
    // Same digest as Android's host: SHA-256 of each signing certificate (DER), in hex.
    val signers = result.signerCertificates.map { cert ->
        MessageDigest.getInstance("SHA-256").digest(cert.encoded).joinToString("") { "%02x".format(it) }
    }
    val manifest = ZipFile(apk).use { zip ->
        val entry = requireNotNull(zip.getEntry("AndroidManifest.xml")) { "${apk.name} has no manifest" }
        zip.getInputStream(entry).use { it.readBytes() }
    }
    val parser = AndroidBinXmlParser(ByteBuffer.wrap(manifest))
    var packageName: String? = null
    var versionName: String? = null
    val metaData = mutableMapOf<String, String>()
    var event = parser.eventType
    while (event != AndroidBinXmlParser.EVENT_END_DOCUMENT) {
        if (event == AndroidBinXmlParser.EVENT_START_ELEMENT) {
            val attributes = (0 until parser.attributeCount).associate { parser.getAttributeName(it) to attributeValue(parser, it) }
            when {
                parser.name == "manifest" && parser.depth == 1 -> {
                    packageName = attributes["package"]
                    versionName = attributes["versionName"]
                }
                parser.name == "meta-data" && parser.depth == 3 -> {
                    val name = attributes["name"]
                    val value = attributes["value"]
                    if (name != null && value != null) metaData[name] = value
                }
            }
        }
        event = parser.next()
    }
    return ApkInfo(requireNotNull(packageName) { "${apk.name} has no package name" }, versionName, metaData, signers)
}

// Null for value types the parser doesn't decode (floats, references); callers fall back like Mihon does.
private fun attributeValue(parser: AndroidBinXmlParser, index: Int): String? = when (parser.getAttributeValueType(index)) {
    AndroidBinXmlParser.VALUE_TYPE_STRING -> parser.getAttributeStringValue(index)
    AndroidBinXmlParser.VALUE_TYPE_INT -> parser.getAttributeIntValue(index).toString()
    AndroidBinXmlParser.VALUE_TYPE_BOOLEAN -> parser.getAttributeBooleanValue(index).toString()
    else -> null
}
