import { TextInput } from "react-native";

// react-native-web lacks `currentlyFocusedInput`, which panelui-native's SearchBar calls.
// RN types the field readonly; react-native-web just never sets it.
const state: {
  currentlyFocusedInput?: unknown;
  currentlyFocusedField: unknown;
} = TextInput.State;
state.currentlyFocusedInput ??= state.currentlyFocusedField;
