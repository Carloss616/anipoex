package java.util.logging;

/** Prints WARNING and up to stderr, which the host keeps off the protocol; finer levels report not loggable. */
public class Logger {
    private final String name;
    private volatile Level level = Level.WARNING;

    protected Logger(String name, String resourceBundleName) {
        this.name = name;
    }

    public static Logger getLogger(String name) {
        return new Logger(name, null);
    }

    public static Logger getAnonymousLogger() {
        return new Logger(null, null);
    }

    public String getName() {
        return name;
    }

    public Level getLevel() {
        return level;
    }

    public void setLevel(Level newLevel) {
        level = newLevel;
    }

    public boolean isLoggable(Level level) {
        return level.intValue() >= this.level.intValue();
    }

    public void log(Level level, String msg) {
        log(level, msg, null);
    }

    public void log(Level level, String msg, Throwable thrown) {
        if (!isLoggable(level)) return;
        System.err.println(level + " " + name + ": " + msg);
        if (thrown != null) thrown.printStackTrace();
    }

    public void severe(String msg) {
        log(Level.SEVERE, msg);
    }

    public void warning(String msg) {
        log(Level.WARNING, msg);
    }

    public void info(String msg) {
        log(Level.INFO, msg);
    }

    public void fine(String msg) {
        log(Level.FINE, msg);
    }

    public void finer(String msg) {
        log(Level.FINER, msg);
    }

    public void finest(String msg) {
        log(Level.FINEST, msg);
    }
}
