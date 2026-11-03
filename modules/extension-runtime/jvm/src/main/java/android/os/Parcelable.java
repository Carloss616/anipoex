package android.os;

/** Android's Parcelable, for the types a source passes between its own screens; nothing is ever parceled here. */
public interface Parcelable {
    int describeContents();

    void writeToParcel(Parcel dest, int flags);

    interface Creator<T> {
        T createFromParcel(Parcel source);

        T[] newArray(int size);
    }
}
