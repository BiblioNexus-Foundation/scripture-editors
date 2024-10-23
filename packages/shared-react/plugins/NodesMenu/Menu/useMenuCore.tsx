import { useReducer, useCallback } from "react";

type State = {
  optionsCount: number;
  activeIndex: number;
  selectedIndex: number;
};

type Action =
  | { type: "MOVE_UP" }
  | { type: "MOVE_DOWN" }
  | { type: "SELECT" }
  | { type: "SET_ACTIVE_INDEX"; index: number }
  | { type: "SET_SELECTED_INDEX"; index: number }
  | { type: "UPDATE_OPTIONS_COUNT"; count: number };

const initialState: State = {
  optionsCount: 0,
  activeIndex: 0,
  selectedIndex: -1,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "MOVE_UP":
      return {
        ...state,
        activeIndex: (state.activeIndex - 1 + state.optionsCount) % state.optionsCount,
      };
    case "MOVE_DOWN":
      return {
        ...state,
        activeIndex: (state.activeIndex + 1) % state.optionsCount,
      };
    case "SELECT":
      return {
        ...state,
        selectedIndex: state.activeIndex !== -1 ? state.activeIndex : state.selectedIndex,
      };
    case "SET_ACTIVE_INDEX":
      return {
        ...state,
        activeIndex: action.index,
      };
    case "SET_SELECTED_INDEX":
      return {
        ...state,
        selectedIndex: action.index,
      };
    case "UPDATE_OPTIONS_COUNT":
      return {
        ...state,
        optionsCount: action.count,
        activeIndex: state.activeIndex >= action.count ? action.count - 1 : state.activeIndex,
      };
    default:
      return state;
  }
}

export function useMenuCore(initialOptionsCount: number) {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    optionsCount: initialOptionsCount,
  });

  // Memoized utility functions to wrap dispatch calls
  const moveUp = useCallback(() => dispatch({ type: "MOVE_UP" }), [dispatch]);
  const moveDown = useCallback(() => dispatch({ type: "MOVE_DOWN" }), [dispatch]);
  const select = useCallback(() => dispatch({ type: "SELECT" }), [dispatch]);
  const setActiveIndex = useCallback(
    (index: number) => dispatch({ type: "SET_ACTIVE_INDEX", index }),
    [dispatch],
  );
  const setSelectedIndex = useCallback(
    (index: number) => dispatch({ type: "SET_SELECTED_INDEX", index }),
    [dispatch],
  );
  const updateOptionsCount = useCallback(
    (count: number) => dispatch({ type: "UPDATE_OPTIONS_COUNT", count }),
    [dispatch],
  );

  return {
    state,
    moveUp,
    moveDown,
    select,
    setActiveIndex,
    setSelectedIndex,
    updateOptionsCount,
  };
}
