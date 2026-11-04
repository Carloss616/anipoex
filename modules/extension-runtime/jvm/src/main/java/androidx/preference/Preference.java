package androidx.preference;

/**
 * Only setupPreferenceScreen names settings classes, and the server never
 * calls it; the verifier still loads them, so they keep Android's hierarchy
 * and nothing else.
 */
public class Preference {
    public interface OnPreferenceChangeListener {}

    public interface OnPreferenceClickListener {}
}
