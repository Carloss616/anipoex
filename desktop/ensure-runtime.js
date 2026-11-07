import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

// Builds the extension server and its JVM the first time `bun desktop` runs.
// A change in modules/extension-runtime/jvm still needs `build:runtime`.
const ROOT = path.join(import.meta.dirname, "..");
const SERVER = path.join(
  ROOT,
  "modules/extension-runtime/jvm/build/install/extension-runtime",
);
const GRADLEW = path.join(
  ROOT,
  process.platform === "win32" ? "android/gradlew.bat" : "android/gradlew",
);

const run = (command, args) => {
  // A .bat only runs through a shell on Windows, which splits an unquoted
  // path at its spaces.
  const shell = process.platform === "win32";
  const { status } = spawnSync(shell ? `"${command}"` : command, args, {
    cwd: ROOT,
    stdio: "inherit",
    shell,
  });
  if (status !== 0) process.exit(status ?? 1);
};

if (!existsSync(SERVER)) {
  console.log("Building the extension server (first run, a few minutes)…");
  if (!existsSync(GRADLEW)) {
    run("bunx", ["expo", "prebuild", "-p", "android", "--no-install"]);
  }
  run(GRADLEW, [
    "-p",
    "modules/extension-runtime/jvm",
    "installDist",
    "jlinkRuntime",
  ]);
}
