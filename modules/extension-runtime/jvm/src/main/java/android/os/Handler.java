package android.os;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

/** Runs callbacks on its looper's thread, like Android's Handler. */
public class Handler {
    private final Looper looper;
    private final Map<Runnable, Future<?>> pending = new HashMap<>();

    public Handler(Looper looper) {
        this.looper = looper;
    }

    public Handler() {
        this(Looper.getMainLooper());
    }

    public final Looper getLooper() {
        return looper;
    }

    public final boolean post(Runnable r) {
        return postDelayed(r, 0);
    }

    public final boolean postDelayed(Runnable r, long delayMillis) {
        // Locked, so a post that runs at once can't remove its entry before it's added and leak it.
        synchronized (pending) {
            pending.put(r, looper.executor.schedule(() -> {
                synchronized (pending) {
                    pending.remove(r);
                }
                r.run();
            }, Math.max(0, delayMillis), TimeUnit.MILLISECONDS));
        }
        return true;
    }

    // shortcut: cancels only the latest post of r, enough for the extensions that call it.
    public final void removeCallbacks(Runnable r) {
        Future<?> future;
        synchronized (pending) {
            future = pending.remove(r);
        }
        if (future != null) future.cancel(false);
    }
}
