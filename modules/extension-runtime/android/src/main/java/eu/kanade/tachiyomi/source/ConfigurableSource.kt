/** @see https://github.com/mihonapp/mihon/blob/main/source-api/src/main/kotlin/eu/kanade/tachiyomi/source/ConfigurableSource.kt */
package eu.kanade.tachiyomi.source

import androidx.preference.PreferenceScreen

@Suppress("Unused")
interface ConfigurableSource {

    fun setupPreferenceScreen(screen: PreferenceScreen)
}
