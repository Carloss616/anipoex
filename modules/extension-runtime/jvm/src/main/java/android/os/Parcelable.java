package android.os;

/** For types a source passes between its screens; nothing is parceled here. */
public interface Parcelable {
    int describeContents();

    void writeToParcel(Parcel dest, int flags);

    interface Creator<T> {
        T createFromParcel(Parcel source);

        T[] newArray(int size);
    }
}
