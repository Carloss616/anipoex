package android.graphics.drawable;

import android.graphics.Rect;

/** For the window background a source's dialog sets; nothing draws it. */
public abstract class Drawable {
    private final Rect bounds = new Rect();

    public Rect getBounds() {
        return bounds;
    }

    public void invalidateSelf() {}
}
