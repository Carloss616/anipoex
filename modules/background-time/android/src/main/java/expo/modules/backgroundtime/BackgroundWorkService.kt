package expo.modules.backgroundtime

import android.app.Notification
import android.app.PendingIntent
import android.app.Service
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.IBinder
import android.os.PowerManager
import androidx.core.app.NotificationChannelCompat
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.app.ServiceCompat

/**
 * Keeps the app running off screen, the phone locked included, while work the
 * user started runs: the cached-app freezer and Doze leave a foreground service
 * alone, and the wake lock keeps the CPU up. The notification only satisfies
 * Android: each kind of work shows its own.
 *
 * Mihon keeps its downloads in a dataSync foreground the same way:
 * https://github.com/mihonapp/mihon/blob/main/app/src/main/java/eu/kanade/tachiyomi/data/download/DownloadWorker.kt
 */
class BackgroundWorkService : Service() {
  private var wakeLock: PowerManager.WakeLock? = null

  override fun onBind(intent: Intent?): IBinder? = null

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    ServiceCompat.startForeground(
      this,
      NOTIFICATION_ID,
      notification(),
      ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC
    )
    if (wakeLock == null) {
      wakeLock = getSystemService(PowerManager::class.java)
        .newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "anipoex:background-work")
        .apply { acquire(BUDGET_MS) }
    }
    // A killed app has no work left to keep alive.
    return START_NOT_STICKY
  }

  override fun onTimeout(startId: Int, fgsType: Int) {
    onTimeout?.invoke()
    stopSelf()
  }

  override fun onDestroy() {
    wakeLock?.takeIf { it.isHeld }?.release()
    wakeLock = null
    super.onDestroy()
  }

  private fun notification(): Notification {
    NotificationManagerCompat.from(this).createNotificationChannel(
      NotificationChannelCompat.Builder(CHANNEL, NotificationManagerCompat.IMPORTANCE_MIN)
        .setName("Background work")
        .build()
    )
    val open = packageManager.getLaunchIntentForPackage(packageName)?.let {
      PendingIntent.getActivity(this, 0, it, PendingIntent.FLAG_IMMUTABLE)
    }
    return NotificationCompat.Builder(this, CHANNEL)
      .setSmallIcon(applicationInfo.icon)
      .setContentTitle("Working in the background")
      .setContentIntent(open)
      .setOngoing(true)
      .setSilent(true)
      .setPriority(NotificationCompat.PRIORITY_MIN)
      .build()
  }

  companion object {
    private const val CHANNEL = "background-work"
    private const val NOTIFICATION_ID = 0x6277

    /** Android 15's dataSync budget: 6 hours a day. */
    private const val BUDGET_MS = 6 * 60 * 60 * 1000L

    /** Called once Android 15 takes the budget back, before the service stops. */
    var onTimeout: (() -> Unit)? = null
  }
}
