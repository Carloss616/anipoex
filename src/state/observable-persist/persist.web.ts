// MMKV on web is a localStorage shim that throws during the Node render pass.
// This plugin no-ops when localStorage is missing, so SSR stays quiet.
export { ObservablePersistLocalStorage as ObservablePersist } from "@legendapp/state/persist-plugins/local-storage";
