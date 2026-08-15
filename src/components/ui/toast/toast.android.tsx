import {
  Box,
  SnackbarHost,
  type SnackbarHostRef,
} from "@expo/ui/jetpack-compose";
import { align, fillMaxWidth } from "@expo/ui/jetpack-compose/modifiers";
import { SafeAreaView as SafeAreaViewBase } from "react-native-safe-area-context";
import { withUniwind } from "uniwind";
import { Host } from "../host";
import type { ShowToast } from "./toast";

const SafeAreaView = withUniwind(SafeAreaViewBase);

// one global host, so `show` threads no ref; context if a screen ever needs
// its own stack.
let host: SnackbarHostRef | null = null;

export function ToastHost() {
  return (
    <SafeAreaView
      pointerEvents="box-none"
      className="absolute inset-x-0 bottom-0"
    >
      <Host matchContents={{ vertical: true }} className="w-full">
        <Box modifiers={[align("bottomCenter"), fillMaxWidth()]}>
          <SnackbarHost
            ref={(ref) => {
              host = ref;
            }}
          />
        </Box>
      </Host>
    </SafeAreaView>
  );
}

/** @see https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/snackbar/ */
const show: ShowToast = (message, options) => {
  host
    ?.showSnackbar({
      message,
      actionLabel: options?.actionLabel,
      withDismissAction: true,
    })
    .then((result) => {
      if (result === "actionPerformed") options?.onAction?.();
    });
};

// M3 snackbars carry no severity color, so every variant is the same snackbar.
export const toast = Object.assign(show, {
  info: show,
  success: show,
  warning: show,
  destructive: show,
});
