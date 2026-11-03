package android.content;

import android.net.Uri;

/** Android's Intent, for the link a source's settings open; {@link ContextWrapper#startActivity} has nothing to start it in. */
public class Intent {
    public static final String ACTION_VIEW = "android.intent.action.VIEW";

    public Intent() {}

    public Intent(String action) {}

    public Intent(String action, Uri uri) {}

    public Intent(Context context, Class<?> cls) {}

    public Intent setAction(String action) {
        return this;
    }

    public Intent putExtra(String name, String value) {
        return this;
    }

    public Uri getData() {
        return null;
    }

    public Intent addFlags(int flags) {
        return this;
    }

    public Intent setFlags(int flags) {
        return this;
    }
}
