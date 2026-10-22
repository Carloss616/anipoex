package android.webkit;

import java.util.ArrayList;
import java.util.List;
import okhttp3.Cookie;
import okhttp3.HttpUrl;

/** Android's cookie store on the JVM, the one AndroidCookieJar and extensions share; OkHttp's Cookie gives it RFC 6265 domain, path and expiry rules. */
public class CookieManager {
    private static final CookieManager INSTANCE = new CookieManager();

    // shortcut: in memory, so cookies don't outlive the process as Android's do; persist them when a source needs a login to survive restarts.
    private final List<Cookie> cookies = new ArrayList<>();

    private CookieManager() {}

    public static CookieManager getInstance() {
        return INSTANCE;
    }

    public synchronized String getCookie(String url) {
        HttpUrl httpUrl = HttpUrl.parse(url);
        if (httpUrl == null) return null;
        long now = System.currentTimeMillis();
        cookies.removeIf(cookie -> cookie.expiresAt() <= now);
        StringBuilder out = new StringBuilder();
        for (Cookie cookie : cookies) {
            if (cookie.matches(httpUrl)) out.append(out.length() == 0 ? "" : "; ").append(cookie.name()).append('=').append(cookie.value());
        }
        return out.length() == 0 ? null : out.toString();
    }

    public synchronized void setCookie(String url, String value) {
        HttpUrl httpUrl = HttpUrl.parse(url);
        Cookie cookie = httpUrl == null ? null : Cookie.parse(httpUrl, value);
        if (cookie == null) return;
        // A cookie replaces the one with its name, domain and path; an expired one only deletes it.
        cookies.removeIf(old -> old.name().equals(cookie.name()) && old.domain().equals(cookie.domain()) && old.path().equals(cookie.path()));
        if (cookie.expiresAt() > System.currentTimeMillis()) cookies.add(cookie);
    }

    public synchronized void removeAllCookies(ValueCallback<Boolean> callback) {
        cookies.clear();
        if (callback != null) callback.onReceiveValue(true);
    }

    public void flush() {}
}
