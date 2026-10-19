/** @see https://github.com/mihonapp/mihon/blob/main/source-api/src/main/kotlin/eu/kanade/tachiyomi/source/SourceFactory.kt */
package eu.kanade.tachiyomi.source

/**
 * A factory for creating sources at runtime.
 */
@Suppress("Unused")
interface SourceFactory {
    /**
     * Create a new copy of the sources
     * @return The created sources
     */
    fun createSources(): List<Source>
}
