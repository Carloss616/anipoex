/** @see https://github.com/mihonapp/mihon/blob/main/source-api/src/main/kotlin/eu/kanade/tachiyomi/source/model/UpdateStrategy.kt */
package eu.kanade.tachiyomi.source.model

@Suppress("Unused")
enum class UpdateStrategy {
    ALWAYS_UPDATE,
    ONLY_FETCH_ONCE,
}
