import { Icon } from "./icon";

// Symbols typed for one native API (`SFSymbol` records, `NativeTabs`
// `sf`/`md`) stay in their platform file.
export const Icons = {
  // Actions
  add: Icon.select({
    ios: "plus",
    android: require("@expo/material-symbols/add.xml"),
    web: "plus",
  }),
  refresh: Icon.select({
    ios: "arrow.clockwise",
    android: require("@expo/material-symbols/refresh.xml"),
    web: "refresh-cw",
  }),
  stop: Icon.select({
    ios: "stop.fill",
    android: require("@expo/material-symbols/stop.xml"),
    web: "square",
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
  moveUp: Icon.select({
    ios: "arrow.up",
    android: require("@expo/material-symbols/arrow_upward.xml"),
    web: "arrow-up",
  }),
  moveDown: Icon.select({
    ios: "arrow.down",
    android: require("@expo/material-symbols/arrow_downward.xml"),
    web: "arrow-down",
  }),
  moveToTop: Icon.select({
    ios: "arrow.up.to.line",
    android: require("@expo/material-symbols/vertical_align_top.xml"),
    web: "arrow-up-to-line",
  }),
  website: Icon.select({
    ios: "globe",
    android: require("@expo/material-symbols/language.xml"),
    web: "globe",
  }),
  more: Icon.select({
    ios: "ellipsis",
    android: require("@expo/material-symbols/more_vert.xml"),
    web: "ellipsis-vertical",
  }),
  copy: Icon.select({
    ios: "doc.on.doc",
    android: require("@expo/material-symbols/content_copy.xml"),
    web: "copy",
  }),
  trash: Icon.select({
    ios: "trash",
    android: require("@expo/material-symbols/delete.xml"),
    web: "trash-2",
  }),
  search: Icon.select({
    ios: "magnifyingglass",
    android: require("@expo/material-symbols/search.xml"),
    web: "search",
  }),
  history: Icon.select({
    ios: "clock.arrow.circlepath",
    android: require("@expo/material-symbols/history.xml"),
    web: "history",
  }),
  searchTitles: Icon.select({
    ios: "doc.text.magnifyingglass",
    android: require("@expo/material-symbols/find_in_page.xml"),
    web: "book-search",
  }),
  searchTitlesOff: Icon.select({
    ios: "minus.magnifyingglass",
    android: require("@expo/material-symbols/search_off.xml"),
    web: "search-x",
  }),
  swap: Icon.select({
    ios: "arrow.right.arrow.left",
    android: require("@expo/material-symbols/swap_horiz.xml"),
    web: "arrow-left-right",
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
  deselect: Icon.select({
    ios: "xmark.square",
    android: require("@expo/material-symbols/deselect.xml"),
    web: "mouse-pointer-2-off",
  }),
  exclude: Icon.select({
    ios: "eye.slash",
    android: require("@expo/material-symbols/visibility_off.xml"),
    web: "eye-off",
  }),
  undo: Icon.select({
    ios: "arrow.uturn.backward",
    android: require("@expo/material-symbols/undo.xml"),
    web: "undo-2",
  }),
  close: Icon.select({
    ios: "xmark",
    android: require("@expo/material-symbols/close.xml"),
    web: "x",
  }),
  closeCircle: Icon.select({
    ios: "xmark.circle",
    android: require("@expo/material-symbols/cancel.xml"),
    web: "circle-x",
  }),

  // Navigation
  back: Icon.select({
    ios: "chevron.left",
    android: require("@expo/material-symbols/arrow_back.xml"),
    web: "chevron-left",
  }),
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

  repos: Icon.select({
    ios: "shippingbox",
    android: require("@expo/material-symbols/package_2.xml"),
    web: "package",
  }),

  // State
  check: Icon.select({
    ios: "checkmark",
    android: require("@expo/material-symbols/check.xml"),
    web: "check",
  }),
  read: Icon.select({
    ios: "checkmark",
    android: require("@expo/material-symbols/done_all.xml"),
    web: "check-check",
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

  info: Icon.select({
    ios: "info.circle",
    android: require("@expo/material-symbols/info.xml"),
    web: "info",
  }),
  error: Icon.select({
    ios: "exclamationmark.triangle",
    android: require("@expo/material-symbols/warning.xml"),
    web: "triangle-alert",
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
  themeSystem: Icon.select({
    ios: "circle.lefthalf.filled",
    android: require("@expo/material-symbols/brightness_4.xml"),
    web: "sun-moon",
  }),
  themeLight: Icon.select({
    ios: "sun.max",
    android: require("@expo/material-symbols/light_mode.xml"),
    web: "sun",
  }),
  themeDark: Icon.select({
    ios: "moon",
    android: require("@expo/material-symbols/dark_mode.xml"),
    web: "moon",
  }),
};
