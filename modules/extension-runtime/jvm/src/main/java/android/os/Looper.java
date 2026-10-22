package android.os;

import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;

/** One "main" thread stands in for Android's UI thread: extensions post to it and check whether they're on it. */
public final class Looper {
    private static final Looper MAIN = new Looper();

    private volatile Thread thread;
    final ScheduledExecutorService executor = Executors.newSingleThreadScheduledExecutor(runnable -> {
        Thread t = new Thread(runnable, "main");
        t.setDaemon(true);
        thread = t;
        return t;
    });

    private Looper() {}

    public static Looper getMainLooper() {
        return MAIN;
    }

    /** The main looper on its own thread, null elsewhere: no other thread has one, as on Android unless it called prepare(). */
    public static Looper myLooper() {
        return Thread.currentThread() == MAIN.thread ? MAIN : null;
    }

    public Thread getThread() {
        return thread;
    }

    public boolean isCurrentThread() {
        return Thread.currentThread() == thread;
    }
}
