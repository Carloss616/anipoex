package android.os;

/** Its looper keeps the thread that runs the posts: start() does nothing. */
public class HandlerThread extends Thread {
    private final Looper looper;

    public HandlerThread(String name) {
        super(name);
        looper = new Looper(name);
    }

    public Looper getLooper() {
        return looper;
    }

    public boolean quitSafely() {
        looper.quitSafely();
        return true;
    }
}
