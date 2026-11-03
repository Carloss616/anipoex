package android.content;

import android.content.res.Resources;
import android.util.Log;

/** In Android's hierarchy between Context and Application; extensions name it. */
public abstract class ContextWrapper extends Context {
    public Resources getResources() {
        return Resources.getSystem();
    }

    /** No screen to open it on: the link a source offers in its settings goes to the log. */
    public void startActivity(Intent intent) {
        Log.i("Intent", "Not started: " + intent);
    }
}
