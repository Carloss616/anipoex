import { TextInput } from "react-native";

// react-native-web lacks `currentlyFocusedInput`, which panelui-native's SearchBar calls.
const state = TextInput.State;
state.currentlyFocusedInput ??= state.currentlyFocusedField as never;
