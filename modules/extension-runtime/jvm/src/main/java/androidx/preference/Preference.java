package androidx.preference;

/** Settings screen classes are only named by setupPreferenceScreen, which the server never calls; the verifier still loads them, so they keep Android's hierarchy and nothing else. */
public class Preference {
    public interface OnPreferenceChangeListener {}

    public interface OnPreferenceClickListener {}
}
