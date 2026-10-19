package android.webkit;

/** Android's one-method callback interface. */
public interface ValueCallback<T> {
    void onReceiveValue(T value);
}
