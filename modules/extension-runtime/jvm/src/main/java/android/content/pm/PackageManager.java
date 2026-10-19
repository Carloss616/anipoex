package android.content.pm;

/** Answers for the host app only, which is all AppInfo asks. */
public class PackageManager {
    private final PackageInfo info = new PackageInfo();

    public PackageManager(String versionName, int versionCode) {
        info.versionName = versionName;
        info.versionCode = versionCode;
    }

    public PackageInfo getPackageInfo(String packageName, int flags) {
        return info;
    }
}
