package android.text.method

interface TransformationMethod

open class PasswordTransformationMethod : TransformationMethod {
    companion object {
        private val INSTANCE = PasswordTransformationMethod()

        @JvmStatic
        fun getInstance(): PasswordTransformationMethod = INSTANCE
    }
}
