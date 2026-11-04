package android.os;

import java.util.Locale;

/** The JVM's one default locale as Android's ranked list (Accept-Language). */
public final class LocaleList {
    private final Locale locale;

    private LocaleList(Locale locale) {
        this.locale = locale;
    }

    public static LocaleList getDefault() {
        return new LocaleList(Locale.getDefault());
    }

    public int size() {
        return 1;
    }

    public Locale get(int index) {
        return index == 0 ? locale : null;
    }
}
