package android.content;

/** No dialog ever shows here, so none of these listeners fires. */
public interface DialogInterface {
    void cancel();

    void dismiss();

    interface OnCancelListener {
        void onCancel(DialogInterface dialog);
    }

    interface OnDismissListener {
        void onDismiss(DialogInterface dialog);
    }

    interface OnClickListener {
        void onClick(DialogInterface dialog, int which);
    }
}
