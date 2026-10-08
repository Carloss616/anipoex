import { Platform } from "react-native";

/** An icon inside a button: Material's 24dp on Android, 18 elsewhere. */
export const BUTTON_ICON_SIZE = Platform.OS === "android" ? 24 : 18;
