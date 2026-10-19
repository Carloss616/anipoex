/** @see https://github.com/mihonapp/mihon/blob/main/source-api/src/main/kotlin/eu/kanade/tachiyomi/source/model/Page.kt */
package eu.kanade.tachiyomi.source.model

import android.net.Uri

@Suppress("Unused")
class Page(
    val index: Int,
    val url: String = "",
    var imageUrl: String? = null,
    var uri: Uri? = null,
)
