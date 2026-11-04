package android.os;

import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;

/**
 * One "main" thread stands in for Android's UI thread: extensions post to it
 * and check whether they're on it. A HandlerThread brings its own.
 */
public final class Looper {
    private static final Looper MAIN = new Looper("main");
    private static final ThreadLocal<Looper> CURRENT = new ThreadLocal<>();

    private volatile Thread thread;
    final ScheduledExecutorService executor;

    Looper(String threadName) {
        executor = Executors.newSingleThreadScheduledExecutor(runnable -> {
            Thread t = new Thread(() -> {
                CURRENT.set(this);
                runnable.run();
            }, threadName);
            t.setDaemon(true);
            thread = t;
            return t;
        });
    }

    public static Looper getMainLooper() {
        return MAIN;
    }

    /** This thread's looper, null without one, as Android before prepare(). */
    public static Looper myLooper() {
        return CURRENT.get();
    }

    public Thread getThread() {
        return thread;
    }

    public boolean isCurrentThread() {
        return Thread.currentThread() == thread;
    }

    public void quitSafely() {
        executor.shutdown();
    }
}
