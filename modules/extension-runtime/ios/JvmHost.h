#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

/// Runs `anipoex.server.Bridge.call` on the embedded JVM (booted once, on first use) and returns its `{"result"}`/`{"error"}` envelope; blocks, so call it from a thread with an 8 MiB stack (a smaller one gets an error envelope).
FOUNDATION_EXPORT NSString *AnipoexJvmCall(NSString *method, NSString *argsJson, NSURL *frameworkURL, NSURL *jarsURL, NSURL *dataURL);

/// What the runtime asks the app for (a browser to solve a Cloudflare challenge, or to fetch a site it solved), as `anipoex.server.IosHost.call`: a method and JSON args in, a `{"result"}`/`{"error"}` envelope out. Called on a runtime thread, never the main one, and may block.
FOUNDATION_EXPORT void AnipoexSetHostHandler(NSString *(^handler)(NSString *method, NSString *argsJson));

NS_ASSUME_NONNULL_END
