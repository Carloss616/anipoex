// JvmHost smoke for the simulator: smoke <framework> <jars> <dataDir> main|relist <pkg>|missingJars; prints one PASS/FAIL/SKIP line per case.
#import <Foundation/Foundation.h>
#include <stdio.h>
#include <unistd.h>
#import "JvmHost.h"

static NSURL *frameworkURL, *jarsURL, *dataURL;

// Starts every call at once, each on its own 8 MiB thread as the app does, and waits for all of them.
static NSArray<NSString *> *callAll(NSArray<NSArray<NSString *> *> *calls) {
  NSMutableArray<NSString *> *results = [NSMutableArray array];
  dispatch_group_t group = dispatch_group_create();
  for (NSUInteger i = 0; i < calls.count; i++) {
    [results addObject:@""];
    dispatch_group_enter(group);
    NSThread *thread = [[NSThread alloc] initWithBlock:^{
      NSString *envelope = AnipoexJvmCall(calls[i][0], calls[i][1], frameworkURL, jarsURL, dataURL);
      @synchronized(results) { results[i] = envelope; }
      dispatch_group_leave(group);
    }];
    thread.stackSize = 8 << 20;
    [thread start];
  }
  dispatch_group_wait(group, DISPATCH_TIME_FOREVER);
  return results;
}

static NSString *call(NSString *method, NSString *argsJson) { return callAll(@[@[method, argsJson]])[0]; }

static id parse(NSString *envelope) { return [NSJSONSerialization JSONObjectWithData:[envelope dataUsingEncoding:NSUTF8StringEncoding] options:0 error:nil]; }

static BOOL hasResult(NSString *envelope) { return [parse(envelope)[@"result"] isKindOfClass:NSArray.class]; }

static void report(const char *name, BOOL ok, NSString *envelope) {
  if (ok) printf("PASS %s\n", name);
  else printf("FAIL %s: %s\n", name, envelope.UTF8String);
  fflush(stdout);
}

static void runMain(void) {
  // First, so both requests race the lazy boot.
  NSArray<NSString *> *both = callAll(@[@[@"installed", @"{}"], @[@"installed", @"{}"]]);
  report("concurrent", hasResult(both[0]) && hasResult(both[1]), [both componentsJoinedByString:@" | "]);

  NSString *empty = call(@"installed", @"{}");
  report("installedEmpty", [empty isEqualToString:@"{\"result\":[]}"], empty);

  NSString *unknown = call(@"nope🙂", @"{}");
  report("utf16RoundTrip", [unknown isEqualToString:@"{\"error\":\"Unknown method nope🙂\"}"], unknown);

  NSString *apkUrl = NSProcessInfo.processInfo.environment[@"SMOKE_APK_URL"];
  NSString *signingKey = NSProcessInfo.processInfo.environment[@"SMOKE_SIGNING_KEY"];
  if (apkUrl.length == 0 || signingKey.length == 0) {
    printf("SKIP install\n");
    return;
  }
  NSData *args = [NSJSONSerialization dataWithJSONObject:@{@"apkUrl": apkUrl, @"signingKey": signingKey} options:0 error:nil];
  NSString *installed = call(@"install", [[NSString alloc] initWithData:args encoding:NSUTF8StringEncoding]);
  id pkg = parse(installed)[@"result"][@"pkg"];
  // The relist in a new process prints PASS install.
  if ([pkg isKindOfClass:NSString.class]) printf("INSTALLED %s\n", [pkg UTF8String]);
  else report("install", NO, installed);
}

static void runRelist(NSString *pkg) {
  NSString *envelope = call(@"installed", @"{}");
  BOOL listed = NO;
  for (id entry in hasResult(envelope) ? parse(envelope)[@"result"] : @[]) listed = listed || [entry[@"pkg"] isEqual:pkg];
  report("install", listed, envelope);
}

static void runMissingJars(void) {
  NSString *first = call(@"installed", @"{}"), *second = call(@"installed", @"{}");
  NSString *prefix = @"{\"error\":\"Extension runtime failed to start: ";
  report("missingJars", [first hasPrefix:prefix] && [second hasPrefix:prefix], [@[first, second] componentsJoinedByString:@" | "]);
}

int main(int argc, char **argv) {
  if (argc < 5) {
    fprintf(stderr, "usage: smoke <framework> <jars> <dataDir> main|relist <pkg>|missingJars\n");
    return 2;
  }
  // A hang prints no PASS line, and the script counts the missing line as a failure.
  alarm(600);
  frameworkURL = [NSURL fileURLWithPath:@(argv[1])];
  jarsURL = [NSURL fileURLWithPath:@(argv[2])];
  dataURL = [NSURL fileURLWithPath:@(argv[3])];
  NSString *mode = @(argv[4]);
  if ([mode isEqualToString:@"main"]) runMain();
  else if ([mode isEqualToString:@"relist"] && argc > 5) runRelist(@(argv[5]));
  else if ([mode isEqualToString:@"missingJars"]) runMissingJars();
  else return 2;
  fflush(stdout);
  return 0;
}
