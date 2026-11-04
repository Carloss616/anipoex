import { requireNativeModule } from "expo";
import type { RuntimeApi } from "./runtime";
import { bridgeRuntime } from "./utils/bridge-runtime";

const native = requireNativeModule<{
  call(method: string, argsJson: string): Promise<string>;
}>("ExtensionRuntime");

/** iOS runs the JVM core in-app, answering the desktop bridge's envelope. */
export const isRuntimeAvailable: boolean = true;

export const runtime: RuntimeApi = bridgeRuntime((method, args) =>
  native.call(method, JSON.stringify(args)).then(JSON.parse),
);
