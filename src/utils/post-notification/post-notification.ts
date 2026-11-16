import type {
  CustomNotification,
  CustomNotificationFactory,
  CustomNotificationOptions,
} from "expo-widgets";
import type { WidgetUpdates } from "../widget-updates";

export type Shown<P extends object> = Promise<
  CustomNotification<P> | undefined
>;

/**
 * Posts a custom notification; resolves to nothing where it can't.
 * @platform android
 */
export const postNotification = <P extends object>(
  _factory: CustomNotificationFactory<P>,
  _props: P,
  _options: CustomNotificationOptions,
): Shown<P> => Promise.resolve(undefined);

/**
 * A posted notification's updates.
 * @platform android
 */
export const notificationUpdates = <P extends object>(
  _shown: Shown<P>,
): WidgetUpdates<P> => ({ push: () => {}, end: () => Promise.resolve() });
