import type {
  CustomNotificationFactory,
  CustomNotificationOptions,
} from "expo-widgets";
import { PermissionsAndroid } from "react-native";
import { coalesce, notificationLimiter } from "../widget-updates";
import type { Shown } from "./post-notification";

const ENDED = { ongoing: false, autoCancel: true };

// A post or update rejects any undefined value, nested ones too (a cover not
// downloaded yet, a mark's missing icon); JSON drops them.
const defined = <P>(props: P): P => JSON.parse(JSON.stringify(props));

/**
 * Posts an Android custom notification through the shared limiter, also over
 * an ended one, which the user may have dismissed. Denied or dismissed, it
 * resolves to nothing. Queued now, so the notification's updates come after.
 */
export const postNotification = <P extends object>(
  factory: CustomNotificationFactory<P>,
  props: P,
  options: CustomNotificationOptions,
): Shown<P> =>
  new Promise((resolve) =>
    notificationLimiter.run(() => {
      const posted = PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      )
        .catch(() => {})
        .then(() => factory.post(defined(props), options))
        .catch(() => undefined);
      resolve(posted);
      return posted;
    }),
  );

/** A posted notification's updates, coalesced; the end makes it dismissable. */
export const notificationUpdates = <P extends object>(shown: Shown<P>) =>
  coalesce<P>(
    (props, end) =>
      shown.then((notification) =>
        notification?.update(defined(props), end ? ENDED : {}),
      ),
    notificationLimiter,
  );
