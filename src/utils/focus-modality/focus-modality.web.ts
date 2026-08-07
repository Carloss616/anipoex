// `:focus-visible` always matches text fields — even on click — so CSS alone
// can't tell pointer focus from keyboard focus. Tracking the last modality can.
// Read by the `[data-focus-modality="pointer"]` rule in global.css.
const set = (modality: "pointer" | "keyboard") => {
  document.documentElement.dataset.focusModality = modality;
};

if (typeof document !== "undefined") {
  set("pointer");
  document.addEventListener("pointerdown", () => set("pointer"), true);
  document.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Tab") set("keyboard");
    },
    true,
  );
}
