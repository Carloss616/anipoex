package android.webkit;

import android.net.Uri;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

/** In-memory cookies per host. */
public class CookieManager {
    private static final CookieManager INSTANCE = new CookieManager();

    // shortcut: not wired to the OkHttp client (as on Android today) and ignores Path/Expires, until an extension needs a shared jar.
    private final Map<String, Map<String, String>> byHost = new HashMap<>();

    private CookieManager() {}

    public static CookieManager getInstance() {
        return INSTANCE;
    }

    public synchronized String getCookie(String url) {
        String host = Uri.parse(url).getHost();
        Map<String, String> cookies = host == null ? null : byHost.get(host);
        if (cookies == null || cookies.isEmpty()) return null;
        StringBuilder out = new StringBuilder();
        cookies.forEach((name, value) -> out.append(out.length() == 0 ? "" : "; ").append(name).append('=').append(value));
        return out.toString();
    }

    public synchronized void setCookie(String url, String value) {
        String host = Uri.parse(url).getHost();
        if (host == null) return;
        // Only the name=value pair is kept; attributes after the first ';' are dropped.
        String pair = value.split(";", 2)[0];
        int eq = pair.indexOf('=');
        if (eq <= 0) return;
        byHost.computeIfAbsent(host, h -> new LinkedHashMap<>()).put(pair.substring(0, eq).trim(), pair.substring(eq + 1).trim());
    }

    public synchronized void removeAllCookies(ValueCallback<Boolean> callback) {
        byHost.clear();
        if (callback != null) callback.onReceiveValue(true);
    }

    public void flush() {}
}
