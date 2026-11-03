package android.app;

import android.content.ContextWrapper;
import android.content.Intent;
import android.os.Bundle;

/** Android's Activity, for the types a source's dialog helpers name: the host has no screen, so none is ever running. */
public abstract class Activity extends ContextWrapper {
    public Application getApplication() {
        return null;
    }

    protected void onCreate(Bundle savedInstanceState) {}

    public Intent getIntent() {
        return new Intent();
    }

    public void finish() {}

    public boolean isFinishing() {
        return true;
    }

    public boolean isDestroyed() {
        return true;
    }

    public void runOnUiThread(Runnable action) {}
}
