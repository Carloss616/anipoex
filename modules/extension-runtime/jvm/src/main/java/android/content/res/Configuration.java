package android.content.res;

/** Android's Configuration: a light, portrait screen. */
public class Configuration {
    public static final int UI_MODE_NIGHT_MASK = 0x30;
    public static final int UI_MODE_NIGHT_NO = 0x10;
    public static final int UI_MODE_NIGHT_YES = 0x20;
    public static final int ORIENTATION_PORTRAIT = 1;
    public static final int ORIENTATION_LANDSCAPE = 2;

    public int uiMode = UI_MODE_NIGHT_NO;
    public int orientation = ORIENTATION_PORTRAIT;
    public int densityDpi = 160;
}
