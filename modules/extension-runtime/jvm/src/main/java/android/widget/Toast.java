package android.widget;

import android.content.Context;
import android.util.Log;

/** No screen to show it on: a toast goes to the log. */
public class Toast {
    public static final int LENGTH_SHORT = 0;
    public static final int LENGTH_LONG = 1;

    private final CharSequence text;

    private Toast(CharSequence text) {
        this.text = text;
    }

    public static Toast makeText(Context context, CharSequence text, int duration) {
        return new Toast(text);
    }

    public void show() {
        Log.i("Toast", String.valueOf(text));
    }
}
