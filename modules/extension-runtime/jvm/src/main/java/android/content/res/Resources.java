package android.content.res;

import android.util.DisplayMetrics;

/** System Resources, for the screen size an offscreen WebView lays out at. */
public class Resources {
    private static final Resources SYSTEM = new Resources();

    private final DisplayMetrics displayMetrics = new DisplayMetrics();
    private final Configuration configuration = new Configuration();

    public static Resources getSystem() {
        return SYSTEM;
    }

    public DisplayMetrics getDisplayMetrics() {
        return displayMetrics;
    }

    public Configuration getConfiguration() {
        return configuration;
    }
}
