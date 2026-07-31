import type { NativeStackNavigationOptions } from "expo-router";

// ponytail: undefined keeps the native header untouched. Only web ships its own.
export const header: NativeStackNavigationOptions["header"] = undefined;
