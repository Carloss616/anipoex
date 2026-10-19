package android.util;

/** Android's Base64 over java.util.Base64: the flags pick alphabet, padding and line wrapping. */
public final class Base64 {
    public static final int DEFAULT = 0;
    public static final int NO_PADDING = 1;
    public static final int NO_WRAP = 2;
    public static final int CRLF = 4;
    public static final int URL_SAFE = 8;

    private Base64() {}

    public static byte[] decode(String input, int flags) {
        // Android ignores whitespace anywhere in the input; java.util.Base64 accepts missing padding as is.
        String clean = input.replaceAll("\\s", "");
        return ((flags & URL_SAFE) != 0 ? java.util.Base64.getUrlDecoder() : java.util.Base64.getDecoder()).decode(clean);
    }

    public static byte[] decode(byte[] input, int flags) {
        return decode(new String(input, java.nio.charset.StandardCharsets.ISO_8859_1), flags);
    }

    public static String encodeToString(byte[] input, int flags) {
        java.util.Base64.Encoder encoder = (flags & URL_SAFE) != 0 ? java.util.Base64.getUrlEncoder() : java.util.Base64.getEncoder();
        if ((flags & NO_PADDING) != 0) encoder = encoder.withoutPadding();
        String text = encoder.encodeToString(input);
        if ((flags & NO_WRAP) != 0) return text;
        // Wrapped output puts a line break after every 76 characters, the last line included.
        String eol = (flags & CRLF) != 0 ? "\r\n" : "\n";
        StringBuilder wrapped = new StringBuilder();
        for (int i = 0; i < text.length(); i += 76) {
            wrapped.append(text, i, Math.min(i + 76, text.length())).append(eol);
        }
        return wrapped.toString();
    }

    public static byte[] encode(byte[] input, int flags) {
        return encodeToString(input, flags).getBytes(java.nio.charset.StandardCharsets.ISO_8859_1);
    }
}
