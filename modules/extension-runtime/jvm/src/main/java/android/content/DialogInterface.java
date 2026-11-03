package android.content;

/** Android's DialogInterface and its listeners; no dialog ever shows here, so none fires. */
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
