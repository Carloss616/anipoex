package android.util;

import java.io.PrintWriter;
import java.io.StringWriter;

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

    public static int v(String tag, String message, Throwable error) {
        return println(VERBOSE, tag, message + "\n" + getStackTraceString(error));
    }

    public static int d(String tag, String message) {
        return println(DEBUG, tag, message);
    }

    public static int d(String tag, String message, Throwable error) {
        return println(DEBUG, tag, message + "\n" + getStackTraceString(error));
    }

    public static int i(String tag, String message) {
        return println(INFO, tag, message);
    }

    public static int i(String tag, String message, Throwable error) {
        return println(INFO, tag, message + "\n" + getStackTraceString(error));
    }

    public static int w(String tag, String message) {
        return println(WARN, tag, message);
    }

    public static int w(String tag, String message, Throwable error) {
        return println(WARN, tag, message + "\n" + getStackTraceString(error));
    }

    public static int w(String tag, Throwable error) {
        return println(WARN, tag, getStackTraceString(error));
    }

    public static int e(String tag, String message) {
        return println(ERROR, tag, message);
    }

    public static int e(String tag, String message, Throwable error) {
        return println(ERROR, tag, message + "\n" + getStackTraceString(error));
    }

    public static int wtf(String tag, String message) {
        return println(ASSERT, tag, message);
    }

    public static int wtf(String tag, String message, Throwable error) {
        return println(ASSERT, tag, message + "\n" + getStackTraceString(error));
    }

    public static int wtf(String tag, Throwable error) {
        return println(ASSERT, tag, getStackTraceString(error));
    }

    public static String getStackTraceString(Throwable error) {
        if (error == null) return "";
        StringWriter trace = new StringWriter();
        error.printStackTrace(new PrintWriter(trace));
        return trace.toString();
    }

    // Android's default threshold is INFO; WARN and up keeps the log file to what matters.
    public static boolean isLoggable(String tag, int level) {
        return level >= WARN;
    }
}
