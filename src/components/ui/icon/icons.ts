import { Icon } from "./icon";

/**
 * Every cross-platform icon, keyed by meaning. Platform-only symbols typed
 * for a native API (`SFSymbol` records, `NativeTabs` `sf`/`md`) stay next to
 * their platform file.
 */
export const Icons = {
  // Actions
  refresh: Icon.select({
    ios: "arrow.clockwise",
    android: require("@expo/material-symbols/refresh.xml"),
    web: "refresh-cw",
  }),
  update: Icon.select({
    ios: "arrow.clockwise",
    android: require("@expo/material-symbols/sync.xml"),
    web: "refresh-cw",
  }),
  download: Icon.select({
    ios: "arrow.down",
    android: require("@expo/material-symbols/download.xml"),
    web: "download",
  }),
  share: Icon.select({
    ios: "square.and.arrow.up",
    android: require("@expo/material-symbols/share.xml"),
    web: "share",
  }),
  openExternal: Icon.select({
    ios: "arrow.up.forward.square",
    android: require("@expo/material-symbols/open_in_new.xml"),
    web: "external-link",
  }),
  more: Icon.select({
    ios: "ellipsis",
    android: require("@expo/material-symbols/more_vert.xml"),
    web: "ellipsis-vertical",
  }),
  filter: Icon.select({
    ios: "line.3.horizontal.decrease",
    android: require("@expo/material-symbols/filter_list.xml"),
    web: "list-filter",
  }),
  language: Icon.select({
    ios: "globe",
    android: require("@expo/material-symbols/translate.xml"),
    web: "languages",
  }),
  close: Icon.select({
    ios: "xmark",
    android: require("@expo/material-symbols/close.xml"),
    web: "x",
  }),

  // Navigation
  chevronRight: Icon.select({
    ios: "chevron.right",
    android: require("@expo/material-symbols/chevron_right.xml"),
    web: "chevron-right",
  }),
  chevronDown: Icon.select({
    ios: "chevron.down",
    android: require("@expo/material-symbols/arrow_drop_down.xml"),
    web: "chevron-down",
  }),

  // State
  check: Icon.select({
    ios: "checkmark",
    android: require("@expo/material-symbols/check.xml"),
    web: "check",
  }),
  checkCircle: Icon.select({
    ios: "checkmark.circle",
    android: require("@expo/material-symbols/check_circle.xml"),
    web: "circle-check",
  }),
  play: Icon.select({
    ios: "play.fill",
    android: require("@expo/material-symbols/play_arrow.xml"),
    web: "play",
  }),
  pause: Icon.select({
    ios: "pause.fill",
    android: require("@expo/material-symbols/pause.xml"),
    web: "pause",
  }),
  hourglass: Icon.select({
    ios: "hourglass",
    android: require("@expo/material-symbols/hourglass.xml"),
    web: "hourglass",
  }),

  // Metadata
  person: Icon.select({
    ios: "person",
    android: require("@expo/material-symbols/person.xml"),
    web: "user",
  }),
  calendar: Icon.select({
    ios: "calendar",
    android: require("@expo/material-symbols/calendar_today.xml"),
    web: "calendar",
  }),
  star: Icon.select({
    ios: "star",
    android: require("@expo/material-symbols/star.xml"),
    web: "star",
  }),
  tag: Icon.select({
    ios: "tag",
    android: require("@expo/material-symbols/sell.xml"),
    web: "tag",
  }),

  // View
  list: Icon.select({
    ios: "list.bullet",
    android: require("@expo/material-symbols/list.xml"),
    web: "list",
  }),
  grid: Icon.select({
    ios: "square.grid.2x2",
    android: require("@expo/material-symbols/grid_view.xml"),
    web: "layout-grid",
  }),
};
