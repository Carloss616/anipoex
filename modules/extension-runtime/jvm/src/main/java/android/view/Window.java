package android.view;

import android.graphics.drawable.Drawable;

/** A dialog's window, which never opens here: its settings do nothing. */
public class Window {
    public void setLayout(int width, int height) {}

    public void setBackgroundDrawable(Drawable drawable) {}

    public void addFlags(int flags) {}

    public void clearFlags(int flags) {}

    public void setDimAmount(float amount) {}
}
