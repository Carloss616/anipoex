package android.content;

import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import java.io.File;

/** JVM stand-in for the part of Android's Context that the host classes and extensions call. */
public abstract class Context {
    public static final int MODE_PRIVATE = 0;

    public abstract File getCacheDir();

    public abstract File getFilesDir();

    public File getExternalCacheDir() {
        return getCacheDir();
    }

    public abstract String getPackageName();

    public abstract PackageManager getPackageManager();

    public abstract SharedPreferences getSharedPreferences(String name, int mode);

    public ApplicationInfo getApplicationInfo() {
        ApplicationInfo info = new ApplicationInfo();
        info.dataDir = getFilesDir().getPath();
        return info;
    }

    public Context getApplicationContext() {
        return this;
    }
}
