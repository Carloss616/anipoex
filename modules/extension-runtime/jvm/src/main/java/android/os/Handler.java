package android.os;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

/** Runs callbacks on its looper's thread, like Android's Handler. */
public class Handler {
    private final Looper looper;
    private final Map<Runnable, Future<?>> pending = new ConcurrentHashMap<>();

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
        pending.put(r, looper.executor.schedule(() -> {
            pending.remove(r);
            r.run();
        }, Math.max(0, delayMillis), TimeUnit.MILLISECONDS));
        return true;
    }

    // shortcut: cancels only the latest post of r, enough for the extensions that call it.
    public final void removeCallbacks(Runnable r) {
        Future<?> future = pending.remove(r);
        if (future != null) future.cancel(false);
    }
}
