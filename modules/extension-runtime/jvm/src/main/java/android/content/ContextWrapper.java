package android.content;

import android.content.res.Resources;
import android.util.Log;

/** Between Context and Application, as on Android; extensions name it. */
public abstract class ContextWrapper extends Context {
    public Resources getResources() {
        return Resources.getSystem();
    }

    /** No screen to open it on: a source's settings link goes to the log. */
    public void startActivity(Intent intent) {
        Log.i("Intent", "Not started: " + intent);
    }
}
