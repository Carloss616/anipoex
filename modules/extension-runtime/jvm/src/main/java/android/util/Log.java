package android.util;

/** Android's Log on stderr: on desktop stdout is the protocol channel and stderr goes to the log file. */
public final class Log {
    public static final int VERBOSE = 2;
    public static final int DEBUG = 3;
    public static final int INFO = 4;
    public static final int WARN = 5;
    public static final int ERROR = 6;
    public static final int ASSERT = 7;

    private static final char[] LEVELS = {'?', '?', 'V', 'D', 'I', 'W', 'E', 'A'};

    private Log() {}

    public static int println(int priority, String tag, String message) {
        System.err.println(LEVELS[Math.max(0, Math.min(priority, ASSERT))] + "/" + tag + ": " + message);
        return 0;
    }

    public static int v(String tag, String message) {
        return println(VERBOSE, tag, message);
    }

    public static int d(String tag, String message) {
        return println(DEBUG, tag, message);
    }

    public static int i(String tag, String message) {
        return println(INFO, tag, message);
    }

    public static int w(String tag, String message) {
        return println(WARN, tag, message);
    }

    public static int w(String tag, Throwable error) {
        return println(WARN, tag, error.toString());
    }

    public static int e(String tag, String message) {
        return println(ERROR, tag, message);
    }

    public static int e(String tag, String message, Throwable error) {
        return println(ERROR, tag, message + "\n" + error);
    }
}
