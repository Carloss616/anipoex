// Simulator slice only: ld binds the JVM's own mprotect calls to this definition; hidden, so nothing outside the dylib sees it.
#include <dlfcn.h>
#include <errno.h>
#include <stddef.h>
#include <sys/mman.h>

__attribute__((visibility("hidden"))) int mprotect(void *addr, size_t len, int prot) {
  static int (*real)(void *, size_t, int);
  if (!real) real = (int (*)(void *, size_t, int))dlsym(RTLD_NEXT, "mprotect");
  int result = real(addr, len, prot);
  // The simulator denies RWX for the code cache; Zero interprets bytecode and never jumps into it, so RW is enough.
  if (result != 0 && errno == EACCES && (prot & PROT_EXEC)) result = real(addr, len, prot & ~PROT_EXEC);
  return result;
}
