package android.net;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** Android's Uri over the RFC 3986 split: parts are kept encoded and decoded on read. */
public class Uri {
    private static final Pattern PARTS = Pattern.compile("^(?:([^:/?#]+):)?(?://([^/?#]*))?([^?#]*)(?:\\?([^#]*))?(?:#(.*))?$", Pattern.DOTALL);
    private static final String UNRESERVED = "_-!.~'()*";

    private final String scheme;
    private final String authority;
    private final String path;
    private final String query;
    private final String fragment;

    private Uri(String scheme, String authority, String path, String query, String fragment) {
        this.scheme = scheme;
        this.authority = authority;
        this.path = path;
        this.query = query;
        this.fragment = fragment;
    }

    public static Uri parse(String value) {
        Matcher m = PARTS.matcher(value);
        // The pattern matches every string.
        m.matches();
        return new Uri(m.group(1), m.group(2), m.group(3), m.group(4), m.group(5));
    }

    public static Uri fromFile(File file) {
        return parse(file.toURI().toString());
    }

    public static String encode(String s) {
        return encode(s, null);
    }

    public static String encode(String s, String allow) {
        StringBuilder out = new StringBuilder();
        for (byte b : s.getBytes(StandardCharsets.UTF_8)) {
            char c = (char) (b & 0xff);
            if (c < 128 && (Character.isLetterOrDigit(c) || UNRESERVED.indexOf(c) >= 0 || (allow != null && allow.indexOf(c) >= 0))) out.append(c);
            else out.append('%').append(Character.toUpperCase(Character.forDigit((c >> 4) & 0xf, 16))).append(Character.toUpperCase(Character.forDigit(c & 0xf, 16)));
        }
        return out.toString();
    }

    public static String decode(String s) {
        return decode(s, false);
    }

    private static String decode(String s, boolean plusAsSpace) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            int hi = c == '%' && i + 2 < s.length() ? Character.digit(s.charAt(i + 1), 16) : -1;
            int lo = hi >= 0 ? Character.digit(s.charAt(i + 2), 16) : -1;
            if (lo >= 0) {
                out.write(hi * 16 + lo);
                i += 2;
            } else if (c == '+' && plusAsSpace) {
                out.write(' ');
            } else {
                byte[] bytes = String.valueOf(c).getBytes(StandardCharsets.UTF_8);
                out.write(bytes, 0, bytes.length);
            }
        }
        return out.toString(StandardCharsets.UTF_8);
    }

    public String getScheme() {
        return scheme;
    }

    public String getHost() {
        if (authority == null) return null;
        String host = authority.substring(authority.lastIndexOf('@') + 1);
        // An IPv6 literal keeps its brackets and colons; otherwise the port goes.
        int colon = host.lastIndexOf(':');
        return colon > host.lastIndexOf(']') ? host.substring(0, colon) : host;
    }

    public String getPath() {
        return decode(path);
    }

    public String getEncodedPath() {
        return path;
    }

    public String getQuery() {
        return query == null ? null : decode(query);
    }

    public String getEncodedQuery() {
        return query;
    }

    public List<String> getPathSegments() {
        List<String> segments = new ArrayList<>();
        for (String segment : path.split("/")) {
            if (!segment.isEmpty()) segments.add(decode(segment));
        }
        return segments;
    }

    public String getLastPathSegment() {
        List<String> segments = getPathSegments();
        return segments.isEmpty() ? null : segments.get(segments.size() - 1);
    }

    public String getQueryParameter(String key) {
        List<String> values = getQueryParameters(key);
        return values.isEmpty() ? null : values.get(0);
    }

    public List<String> getQueryParameters(String key) {
        List<String> values = new ArrayList<>();
        if (query == null) return values;
        for (String pair : query.split("&")) {
            int eq = pair.indexOf('=');
            String name = decode(eq < 0 ? pair : pair.substring(0, eq), true);
            if (name.equals(key)) values.add(eq < 0 ? "" : decode(pair.substring(eq + 1), true));
        }
        return values;
    }

    public Builder buildUpon() {
        Builder builder = new Builder().scheme(scheme).authority(authority);
        builder.path.append(path);
        builder.query.append(query == null ? "" : query);
        return builder;
    }

    @Override
    public String toString() {
        return (scheme == null ? "" : scheme + ":") + (authority == null ? "" : "//" + authority) + path
            + (query == null ? "" : "?" + query) + (fragment == null ? "" : "#" + fragment);
    }

    public static class Builder {
        private String scheme;
        private String authority;
        private final StringBuilder path = new StringBuilder();
        private final StringBuilder query = new StringBuilder();

        public Builder scheme(String scheme) {
            this.scheme = scheme;
            return this;
        }

        public Builder authority(String authority) {
            this.authority = authority;
            return this;
        }

        public Builder path(String path) {
            this.path.setLength(0);
            this.path.append(encode(path, "/"));
            return this;
        }

        public Builder appendPath(String segment) {
            return appendEncodedPath(encode(segment));
        }

        public Builder appendEncodedPath(String segment) {
            if (path.length() == 0 || path.charAt(path.length() - 1) != '/') path.append('/');
            path.append(segment.startsWith("/") ? segment.substring(1) : segment);
            return this;
        }

        public Builder appendQueryParameter(String key, String value) {
            if (query.length() > 0) query.append('&');
            query.append(encode(key)).append('=').append(encode(value));
            return this;
        }

        public Builder clearQuery() {
            query.setLength(0);
            return this;
        }

        public Uri build() {
            return new Uri(scheme, authority, path.toString(), query.length() == 0 ? null : query.toString(), null);
        }

        @Override
        public String toString() {
            return build().toString();
        }
    }
}
