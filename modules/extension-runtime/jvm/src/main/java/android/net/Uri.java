package android.net;

import java.io.File;

/** Holds the string only: Page carries a Uri, and nothing on the host reads its parts yet. */
public class Uri {
    private final String value;

    private Uri(String value) {
        this.value = value;
    }

    public static Uri parse(String value) {
        return new Uri(value);
    }

    public static Uri fromFile(File file) {
        return new Uri(file.toURI().toString());
    }

    @Override
    public String toString() {
        return value;
    }
}
