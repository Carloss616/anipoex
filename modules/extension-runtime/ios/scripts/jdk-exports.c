// Re-exports the static JDK's native registration so JvmHost can call it after dlopen, before JNI_CreateJavaVM.
extern void loadfunctions(void);
__attribute__((visibility("default"))) void AnipoexJDKLoadFunctions(void) { loadfunctions(); }
