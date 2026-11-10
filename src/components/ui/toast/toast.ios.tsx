import { Button, HStack } from "@expo/ui/swift-ui";
import {
  buttonStyle,
  type Color,
  foregroundStyle,
  frame,
  glassEffect,
  lineLimit,
  padding,
} from "@expo/ui/swift-ui/modifiers";
import { observable } from "@legendapp/state";
import { useValue } from "@legendapp/state/react";
import {
  toast as panelToast,
  ToastViewport,
} from "panelui-native/components/toast";
import { PortalHost, PortalProvider } from "panelui-native/primitives/portal";
import { type ReactNode, useEffect } from "react";
import { SafeAreaInsetsContext } from "react-native-safe-area-context";
import { Text, useFont } from "@/components/native/swift-ui/text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Host } from "../host";
import { Icon, Icons } from "../icon";
import { ACTION_TOAST_MS } from "./constants";
import type {
  ShowToast,
  ShowToastOptions,
  ShowToastVariant,
  Toast,
  ToastVariant,
} from "./toast";

// A native sheet covers the root view: while one hosts, the root's host hides.
const sheetHosts$ = observable(0);
const NO_INSETS = { top: 0, right: 0, bottom: 0, left: 0 };

// Its viewport sits at the root; its host may be in a sheet.
export function ToastProvider({ children }: { children: ReactNode }) {
  return <PortalProvider>{children}</PortalProvider>;
}

// The viewport never unmounts: its cleanup pauses every toast's timer.
export function ToastHost() {
  const covered = useValue(() => sheetHosts$.get() > 0);
  return (
    <>
      <ToastViewport />
      {!covered && <PortalHost />}
    </>
  );
}

// shortcut: one sheet hosts at a time; nested ones show each toast twice.
export function SheetToastHost() {
  useEffect(() => {
    sheetHosts$.set((count) => count + 1);
    return () => sheetHosts$.set((count) => count - 1);
  }, []);
  return (
    // The screen's insets don't reach the sheet: the toast sits at its top.
    <SafeAreaInsetsContext.Provider value={NO_INSETS}>
      <PortalHost />
    </SafeAreaInsetsContext.Provider>
  );
}

interface ToastContentProps extends ShowToastOptions {
  label: string;
  hide: () => void;
}

function ToastContent({
  label,
  variant = "default",
  action,
  hide,
}: ToastContentProps) {
  const buttonFont = useFont("body", "medium");

  const [
    muted,
    info,
    infoSoft,
    infoForeground,
    success,
    successSoft,
    successForeground,
    warning,
    warningSoft,
    warningForeground,
    destructive,
    destructiveSoft,
    destructiveForeground,
  ] = useThemeColor([
    "muted",
    "info",
    "info-soft",
    "info-foreground",
    "success",
    "success-soft",
    "success-foreground",
    "warning",
    "warning-soft",
    "warning-foreground",
    "destructive",
    "destructive-soft",
    "destructive-foreground",
  ]);

  const tints: Partial<Record<ToastVariant, Color>> = {
    info: infoSoft,
    success: successSoft,
    warning: warningSoft,
    error: destructiveSoft,
  };

  const foregrounds: Partial<Record<ToastVariant, Color>> = {
    info: infoForeground,
    success: successForeground,
    warning: warningForeground,
    error: destructiveForeground,
  };

  const icons: Partial<Record<ToastVariant, React.ReactNode>> = {
    info: <Icon name={Icons.info} color={info} />,
    success: <Icon name={Icons.checkCircle} color={success} />,
    warning: <Icon name={Icons.error} color={warning} />,
    error: <Icon name={Icons.error} color={destructive} />,
  };

  return (
    <Host
      matchContents={{ vertical: true }}
      ignoreSafeArea="all"
      className="w-full"
    >
      <HStack
        spacing={12}
        modifiers={[
          padding({ horizontal: 16, vertical: 12 }),
          glassEffect({
            glass: {
              variant: "regular",
              interactive: true,
              tint: tints[variant] ?? muted,
            },
            shape: "roundedRectangle",
            cornerRadius: 24,
          }),
        ]}
      >
        {icons[variant]}
        <Text
          modifiers={[
            lineLimit(3),
            frame({ maxWidth: Infinity, alignment: "leading" }),
            ...(foregrounds[variant]
              ? [foregroundStyle(foregrounds[variant])]
              : []),
          ]}
        >
          {label}
        </Text>
        {action && (
          <Button
            label={action.label}
            onPress={() => {
              hide();
              action.onAction();
            }}
            modifiers={[
              buttonStyle("glass"),
              buttonFont,
              foregroundStyle("primary"),
            ]}
          />
        )}
      </HStack>
    </Host>
  );
}

/** Shows a transient message — `toast.error` and friends pick the variant. */
const show: ShowToast = (label, options) => {
  panelToast.show({
    placement: "top",
    component: ({ hide }) => (
      <ToastContent {...options} label={label} hide={hide} />
    ),
    ...(options?.action && { duration: ACTION_TOAST_MS }),
  });
};

function variant(variant: ToastVariant): ShowToastVariant {
  return (label, options) => show(label, { ...options, variant });
}

export const toast: Toast = Object.assign(show, {
  info: variant("info"),
  success: variant("success"),
  warning: variant("warning"),
  error: variant("error"),
});
