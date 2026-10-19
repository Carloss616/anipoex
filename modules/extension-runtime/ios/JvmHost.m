#import "JvmHost.h"
#import <AnipoexJDK/jni.h>
#include <dlfcn.h>
#include <pthread.h>

typedef jint (*CreateJavaVM)(JavaVM **, void **, void *);

static pthread_mutex_t bootLock = PTHREAD_MUTEX_INITIALIZER;
static BOOL bootAttempted;
static NSString *bootError;
static JavaVM *vm;
static jclass bridge;
static jmethodID bridgeCall;

static NSString *toJson(NSDictionary *object) {
  NSData *data = [NSJSONSerialization dataWithJSONObject:object options:NSJSONWritingWithoutEscapingSlashes error:nil];
  return [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
}

static NSString *errorEnvelope(NSString *message) { return toJson(@{@"error": message}); }

// UTF-16 both ways: JNI's modified UTF-8 would mangle characters outside the BMP.
static jstring toJava(JNIEnv *env, NSString *string) {
  NSUInteger length = string.length;
  NSMutableData *chars = [NSMutableData dataWithLength:MAX(length, 1) * sizeof(unichar)];
  [string getCharacters:chars.mutableBytes range:NSMakeRange(0, length)];
  return (*env)->NewString(env, chars.bytes, (jsize)length);
}

static NSString *fromJava(JNIEnv *env, jstring string) {
  const jchar *chars = (*env)->GetStringChars(env, string, NULL);
  NSString *result = [NSString stringWithCharacters:chars length:(NSUInteger)(*env)->GetStringLength(env, string)];
  (*env)->ReleaseStringChars(env, string, chars);
  return result;
}

// Clears a pending Java exception and returns its toString(), or nil when there is none.
static NSString *takeException(JNIEnv *env) {
  jthrowable throwable = (*env)->ExceptionOccurred(env);
  if (!throwable) return nil;
  (*env)->ExceptionClear(env);
  jclass object = (*env)->FindClass(env, "java/lang/Object");
  jstring text = (*env)->CallObjectMethod(env, throwable, (*env)->GetMethodID(env, object, "toString", "()Ljava/lang/String;"));
  if ((*env)->ExceptionCheck(env) || !text) {
    (*env)->ExceptionClear(env);
    return @"Java exception";
  }
  return fromJava(env, text);
}

static NSString *callBridge(JNIEnv *env, NSString *method, NSString *argsJson) {
  jstring out = (*env)->CallStaticObjectMethod(env, bridge, bridgeCall, toJava(env, method), toJava(env, argsJson));
  NSString *exception = takeException(env);
  if (exception) return errorEnvelope(exception);
  return out ? fromJava(env, out) : errorEnvelope(@"Bridge.call returned null");
}

// Finds Bridge and runs init on the thread that created the VM; returns the failure, or nil.
static NSString *startBridge(JNIEnv *env, NSURL *dataURL) {
  jclass local = (*env)->FindClass(env, "anipoex/server/Bridge");
  if (!local) return takeException(env) ?: @"anipoex/server/Bridge not found";
  bridge = (*env)->NewGlobalRef(env, local);
  bridgeCall = (*env)->GetStaticMethodID(env, bridge, "call", "(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;");
  if (!bridgeCall) return takeException(env) ?: @"Bridge.call not found";
  NSString *envelope = callBridge(env, @"init", toJson(@{@"dataDir": dataURL.path}));
  NSDictionary *parsed = [NSJSONSerialization JSONObjectWithData:[envelope dataUsingEncoding:NSUTF8StringEncoding] options:0 error:nil];
  if (![parsed isKindOfClass:NSDictionary.class]) return [@"init returned " stringByAppendingString:envelope];
  id error = parsed[@"error"];
  return error ? [NSString stringWithFormat:@"%@", error] : nil;
}

// dlopen + JNI_CreateJavaVM + Bridge + init; returns the failure, or nil.
static NSString *boot(NSURL *frameworkURL, NSURL *jarsURL, NSURL *dataURL) {
  // The static JDK resolves its own natives with dlsym(RTLD_DEFAULT), so it must load global.
  void *jdk = dlopen([frameworkURL URLByAppendingPathComponent:@"AnipoexJDK"].fileSystemRepresentation, RTLD_NOW | RTLD_GLOBAL);
  if (!jdk) return @(dlerror());
  void (*loadFunctions)(void) = (void (*)(void))dlsym(jdk, "AnipoexJDKLoadFunctions");
  CreateJavaVM create = (CreateJavaVM)dlsym(jdk, "JNI_CreateJavaVM");
  if (!loadFunctions || !create) return @"AnipoexJDK is missing its entry points";

  NSFileManager *files = NSFileManager.defaultManager;
  NSString *tmp = [NSTemporaryDirectory() stringByAppendingString:@"extensions"];
  [files createDirectoryAtPath:tmp withIntermediateDirectories:YES attributes:nil error:nil];
  [files createDirectoryAtURL:dataURL withIntermediateDirectories:YES attributes:nil error:nil];

  NSMutableArray<NSString *> *classPath = [NSMutableArray array];
  NSArray<NSString *> *names = [[files contentsOfDirectoryAtPath:jarsURL.path error:nil] sortedArrayUsingSelector:@selector(compare:)];
  for (NSString *name in names) {
    if ([name.pathExtension isEqualToString:@"jar"] && ![name isEqualToString:@"jul-shim.jar"]) [classPath addObject:[jarsURL URLByAppendingPathComponent:name].path];
  }
  NSString *home = [frameworkURL URLByAppendingPathComponent:@"lib"].path;
  NSArray<NSString *> *options = @[
    [@"-Djava.class.path=" stringByAppendingString:[classPath componentsJoinedByString:@":"]],
    [@"-Xbootclasspath/a:" stringByAppendingString:[jarsURL URLByAppendingPathComponent:@"jul-shim.jar"].path],
    [@"-Djava.home=" stringByAppendingString:home],
    [@"-Djavax.net.ssl.trustStore=" stringByAppendingString:[home stringByAppendingPathComponent:@"lib/security/cacerts"]],
    [@"-Djava.io.tmpdir=" stringByAppendingString:tmp],
    [@"-Duser.home=" stringByAppendingString:dataURL.path],
    @"-Dfile.encoding=UTF-8",
    @"-XX:+UseSerialGC",
    @"-Xms64m",
    @"-Xmx512m",
    @"-Xss8m",
    @"--enable-final-field-mutation=ALL-UNNAMED",
  ];
  JavaVMOption vmOptions[options.count];
  for (NSUInteger i = 0; i < options.count; i++) vmOptions[i] = (JavaVMOption){.optionString = (char *)options[i].UTF8String};
  JavaVMInitArgs args = {.version = JNI_VERSION_1_8, .nOptions = (jint)options.count, .options = vmOptions, .ignoreUnrecognized = JNI_FALSE};

  // The VM takes its path encoding (sun.jnu.encoding) from the C locale, which is ASCII in an app without LANG; non-ASCII paths would fail.
  setenv("LC_CTYPE", "en_US.UTF-8", 0);
  loadFunctions();
  JNIEnv *env;
  jint created = create(&vm, (void **)&env, &args);
  if (created != JNI_OK) {
    vm = NULL;
    return [NSString stringWithFormat:@"JNI_CreateJavaVM returned %d", created];
  }
  NSString *error = startBridge(env, dataURL);
  // Every request attaches its own thread as a daemon, so the creating thread lets go too.
  (*vm)->DetachCurrentThread(vm);
  return error;
}

NSString *AnipoexJvmCall(NSString *method, NSString *argsJson, NSURL *frameworkURL, NSURL *jarsURL, NSURL *dataURL) {
  pthread_mutex_lock(&bootLock);
  if (!bootAttempted) {
    bootAttempted = YES;
    bootError = boot(frameworkURL, jarsURL, dataURL);
  }
  pthread_mutex_unlock(&bootLock);
  // A nil message with no VM (e.g. a non-UTF-8 dlerror) must not fall through to a NULL vm.
  if (bootError || !vm) return errorEnvelope([@"Extension runtime failed to start: " stringByAppendingString:bootError ?: @"the JVM did not start"]);

  JNIEnv *env;
  if ((*vm)->AttachCurrentThreadAsDaemon(vm, (void **)&env, NULL) != JNI_OK) return errorEnvelope(@"Could not attach to the extension runtime");
  NSString *envelope = callBridge(env, method, argsJson);
  (*vm)->DetachCurrentThread(vm);
  return envelope;
}
