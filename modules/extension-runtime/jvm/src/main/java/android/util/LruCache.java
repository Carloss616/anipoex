package android.util;

import java.util.LinkedHashMap;
import java.util.Map;

/** Android's LruCache with the default sizeOf: maxSize counts entries. */
public class LruCache<K, V> {
    private final LinkedHashMap<K, V> map;

    public LruCache(int maxSize) {
        if (maxSize <= 0) throw new IllegalArgumentException("maxSize <= 0");
        map = new LinkedHashMap<K, V>(0, 0.75f, true) {
            @Override
            protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
                return size() > maxSize;
            }
        };
    }

    public final synchronized V get(K key) {
        return map.get(key);
    }

    public final synchronized V put(K key, V value) {
        return map.put(key, value);
    }

    public final synchronized V remove(K key) {
        return map.remove(key);
    }

    public final synchronized int size() {
        return map.size();
    }

    public final synchronized void evictAll() {
        map.clear();
    }
}
