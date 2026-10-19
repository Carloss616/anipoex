#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

/// Runs `anipoex.server.Bridge.call` on the embedded JVM (booted once, on first use) and returns its `{"result"}`/`{"error"}` envelope; blocks, so call it from a thread with an 8 MiB stack.
FOUNDATION_EXPORT NSString *AnipoexJvmCall(NSString *method, NSString *argsJson, NSURL *frameworkURL, NSURL *jarsURL, NSURL *dataURL);

NS_ASSUME_NONNULL_END
