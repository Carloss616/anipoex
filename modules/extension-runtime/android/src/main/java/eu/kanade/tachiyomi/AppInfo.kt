package eu.kanade.tachiyomi

import android.app.Application
import uy.kohesive.injekt.Injekt
import uy.kohesive.injekt.api.get

object AppInfo {

    private val info by lazy {
        val app = Injekt.get<Application>()
        app.packageManager.getPackageInfo(app.packageName, 0)
    }

    @Suppress("DEPRECATION")
    fun getVersionCode(): Int = info.versionCode

    fun getVersionName(): String = info.versionName.orEmpty()
}
