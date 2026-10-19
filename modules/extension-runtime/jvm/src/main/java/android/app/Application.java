package android.app;

import android.content.ContextWrapper;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import anipoex.server.JsonPreferences;
import java.io.File;
import java.util.concurrent.ConcurrentHashMap;

/** The host's Application on the JVM: everything lives under one data directory. */
public class Application extends ContextWrapper {
    private final File dataDir;
    private final PackageManager packageManager;
    private final ConcurrentHashMap<String, SharedPreferences> preferences = new ConcurrentHashMap<>();

    public Application(File dataDir, String versionName, int versionCode) {
        this.dataDir = dataDir;
        this.packageManager = new PackageManager(versionName, versionCode);
    }

    @Override
    public File getCacheDir() {
        return new File(dataDir, "cache");
    }

    @Override
    public File getFilesDir() {
        return dataDir;
    }

    @Override
    public String getPackageName() {
        return "anipoex";
    }

    @Override
    public PackageManager getPackageManager() {
        return packageManager;
    }

    @Override
    public SharedPreferences getSharedPreferences(String name, int mode) {
        return preferences.computeIfAbsent(name, key -> new JsonPreferences(new File(dataDir, "prefs/" + key + ".json")));
    }
}
