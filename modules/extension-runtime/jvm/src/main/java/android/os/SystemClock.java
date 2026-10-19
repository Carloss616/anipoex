package android.os;

/** Android's clocks on the JVM: rate limiters read elapsedRealtime. */
public final class SystemClock {
    private SystemClock() {}

    public static long elapsedRealtime() {
        return System.nanoTime() / 1_000_000;
    }

    public static long elapsedRealtimeNanos() {
        return System.nanoTime();
    }

    public static long uptimeMillis() {
        return System.nanoTime() / 1_000_000;
    }

    public static long currentThreadTimeMillis() {
        return System.nanoTime() / 1_000_000;
    }

    public static void sleep(long ms) {
        try {
            Thread.sleep(ms);
        } catch (InterruptedException ignored) {
            Thread.currentThread().interrupt();
        }
    }
}
