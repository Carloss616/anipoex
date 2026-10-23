package anipoex.server

import android.os.Handler
import android.os.Looper
import kotlinx.coroutines.InternalCoroutinesApi
import kotlinx.coroutines.MainCoroutineDispatcher
import kotlin.coroutines.CoroutineContext

/**
 * Gives extensions `Dispatchers.Main` (the WebView helper runs on it), which kotlinx-coroutines only has on Android:
 * the main Looper's thread, so it and `Looper.myLooper() == Looper.getMainLooper()` agree. Registered in META-INF/services.
 */
@OptIn(InternalCoroutinesApi::class)
class MainDispatcherFactory : kotlinx.coroutines.internal.MainDispatcherFactory {
    override val loadPriority = 0

    override fun createDispatcher(allFactories: List<kotlinx.coroutines.internal.MainDispatcherFactory>): MainCoroutineDispatcher = LooperDispatcher.Main
}

// As Android's: `Main` always posts, `Main.immediate` runs in place when already on the main thread.
private open class LooperDispatcher(private val inPlace: Boolean) : MainCoroutineDispatcher() {
    override val immediate: MainCoroutineDispatcher get() = Immediate

    override fun isDispatchNeeded(context: CoroutineContext) = !inPlace || Looper.myLooper() != Looper.getMainLooper()

    override fun dispatch(context: CoroutineContext, block: Runnable) {
        handler.post(block)
    }

    object Main : LooperDispatcher(inPlace = false)

    object Immediate : LooperDispatcher(inPlace = true)

    private companion object {
        val handler = Handler(Looper.getMainLooper())
    }
}
