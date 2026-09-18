import {
  NotificationFeedbackType,
  notificationAsync,
  selectionAsync,
} from "expo-haptics";
import { noop } from "./utils";

/** A value ticked past a step: a slider detent, a stepper, a picker row. */
export const tick = () => void selectionAsync().catch(noop);

/** An operation the user asked for landed. */
export const succeeded = () =>
  void notificationAsync(NotificationFeedbackType.Success).catch(noop);

/** An operation the user asked for failed. Pairs with the toast, never replaces it. */
export const failed = () =>
  void notificationAsync(NotificationFeedbackType.Error).catch(noop);
