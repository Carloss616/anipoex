package expo.modules.backgroundtime

import android.content.Context
import android.content.Intent
import android.os.Handler
import android.os.Looper
import android.view.Choreographer
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.jstasks.HeadlessJsTaskConfig
import com.facebook.react.jstasks.HeadlessJsTaskContext
import com.facebook.react.modules.core.ReactChoreographer
import expo.modules.kotlin.functions.Queues
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * One foreground service while any named work holds it, with a headless JS
 * task beside it: React Native stops JS timers off screen unless one runs
 * (`JavaTimerManager.onHostPause`).
 */
class BackgroundTimeModule : Module() {
  private val holds = mutableSetOf<String>()
  private var headlessTask: Int? = null
  private val main = Handler(Looper.getMainLooper())

  // JS timers fire only on vsync frames, which stop off screen (a Samsung on
  // Android 16 got none from 40 s after locking), so the held work runs a frame.
  // shortcut: reads ReactChoreographer's private frame callback (kept by
  // proguard-rules.pro); if React Native renames it, timers stall off screen again.
  private val frame: Choreographer.FrameCallback? by lazy {
    runCatching {
      ReactChoreographer::class.java.getDeclaredField("frameCallback")
        .apply { isAccessible = true }
        .get(ReactChoreographer.getInstance()) as Choreographer.FrameCallback
    }.getOrNull()
  }
  private val pump = object : Runnable {
    override fun run() {
      frame?.let {
        // Dropped first, or every pump while vsync is off queues one more.
        Choreographer.getInstance().removeFrameCallback(it)
        it.doFrame(System.nanoTime())
      }
      main.postDelayed(this, PUMP_MS)
    }
  }

  private val context: Context get() = requireNotNull(appContext.reactContext)
  private val service get() = Intent(context, BackgroundWorkService::class.java)
  private val tasks get() = (context as? ReactContext)?.let { HeadlessJsTaskContext.getInstance(it) }

  override fun definition() = ModuleDefinition {
    Name("BackgroundTime")

    Events("onExpire")

    OnCreate {
      BackgroundWorkService.onTimeout = {
        holds.clear()
        finishHeadless()
        sendEvent("onExpire")
      }
    }

    OnDestroy {
      BackgroundWorkService.onTimeout = null
      main.removeCallbacks(pump)
    }

    // False when Android refuses the service: started from the background.
    AsyncFunction("begin") { name: String ->
      if (holds.isEmpty() && !start()) return@AsyncFunction false
      holds.add(name)
      true
    }.runOnQueue(Queues.MAIN)

    AsyncFunction("end") { name: String ->
      if (holds.remove(name) && holds.isEmpty()) {
        context.stopService(service)
        finishHeadless()
      }
    }.runOnQueue(Queues.MAIN)
  }

  private fun start(): Boolean {
    try {
      ContextCompat.startForegroundService(context, service)
    } catch (_: IllegalStateException) {
      // ForegroundServiceStartNotAllowedException, Android 12+.
      return false
    }
    headlessTask = tasks?.startTask(
      HeadlessJsTaskConfig(TASK, Arguments.createMap(), 0, true)
    )
    main.postDelayed(pump, PUMP_MS)
    return true
  }

  private fun finishHeadless() {
    main.removeCallbacks(pump)
    headlessTask?.let { tasks?.finishTask(it) }
    headlessTask = null
  }

  companion object {
    /** Registered by `background-time.android.ts`. */
    const val TASK = "BackgroundWork"
    private const val PUMP_MS = 1_000L
  }
}
