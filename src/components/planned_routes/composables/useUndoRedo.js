import { ref, computed } from "vue";

export function useUndoRedo() {
  // State for undo/redo stacks
  const undoStack = ref([]);
  const redoStack = ref([]);

  // Maximum number of states to keep in memory
  const MAX_STATES = 50;

  // Flag to prevent recording during undo/redo operations
  const isUndoRedoOperation = ref(false);

  // Reference to the getCurrentState function
  const getCurrentStateRef = ref(() => null);

  // Debounce timer for state saving
  let saveTimeout = null;
  const DEBOUNCE_DELAY = 100; // 100ms delay

  // Computed properties for button states
  const canUndo = computed(() => undoStack.value.length > 0);
  const canRedo = computed(() => redoStack.value.length > 0);

  // Function to check if two states are different
  const isStateDifferent = (state1, state2) => {
    if (!state1 || !state2) return true;

    // Compare start point
    if (
      state1.startPoint?.lat !== state2.startPoint?.lat ||
      state1.startPoint?.lng !== state2.startPoint?.lng
    )
      return true;

    // Compare end point
    if (
      state1.endPoint?.lat !== state2.endPoint?.lat ||
      state1.endPoint?.lng !== state2.endPoint?.lng
    )
      return true;

    // Compare waypoints
    if (state1.waypoints?.length !== state2.waypoints?.length) return true;

    for (let i = 0; i < state1.waypoints?.length; i++) {
      if (
        state1.waypoints[i]?.lat !== state2.waypoints[i]?.lat ||
        state1.waypoints[i]?.lng !== state2.waypoints[i]?.lng
      )
        return true;
    }

    // Compare route path
    if (state1.routePath?.length !== state2.routePath?.length) return true;

    for (let i = 0; i < state1.routePath?.length; i++) {
      if (
        state1.routePath[i]?.[0] !== state2.routePath[i]?.[0] ||
        state1.routePath[i]?.[1] !== state2.routePath[i]?.[1]
      )
        return true;
    }

    return false;
  };

  // Function to save current state with debouncing
  const saveState = (state) => {
    if (isUndoRedoOperation.value) {
      return; // Don't save during undo/redo operations
    }

    // Clear existing timeout
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    // Set new timeout for debounced saving
    saveTimeout = setTimeout(() => {
      const currentState = getCurrentStateRef.value();

      // Only save if the state is different from the last saved state
      const lastState =
        undoStack.value.length > 0
          ? undoStack.value[undoStack.value.length - 1]
          : null;

      if (isStateDifferent(currentState, lastState)) {
        // console.log("=== SAVING STATE ===");
        // console.log("Current undo stack size:", undoStack.value.length);
        // console.log("Current redo stack size:", redoStack.value.length);

        // Clear redo stack when new action is performed
        redoStack.value = [];

        // Add current state to undo stack
        undoStack.value.push(JSON.parse(JSON.stringify(currentState)));

        // Limit the size of undo stack
        if (undoStack.value.length > MAX_STATES) {
          undoStack.value.shift();
        }

        // console.log(
        //   "State saved. New undo stack size:",
        //   undoStack.value.length
        // );
        // console.log("=== END SAVING STATE ===");
      } else {
        // console.log("State unchanged, skipping save");
      }
    }, DEBOUNCE_DELAY);
  };

  // Function to force save state immediately (for important actions)
  const forceSaveState = (state) => {
    if (isUndoRedoOperation.value) {
      return; // Don't save during undo/redo operations
    }

    // Clear any pending timeout
    if (saveTimeout) {
      clearTimeout(saveTimeout);
      saveTimeout = null;
    }

    const currentState = getCurrentStateRef.value();

    // Only save if the state is different from the last saved state
    const lastState =
      undoStack.value.length > 0
        ? undoStack.value[undoStack.value.length - 1]
        : null;

    if (isStateDifferent(currentState, lastState)) {
      console.log("=== FORCE SAVING STATE ===");
      console.log("Current undo stack size:", undoStack.value.length);
      console.log("Current redo stack size:", redoStack.value.length);

      // Clear redo stack when new action is performed
      redoStack.value = [];

      // Add current state to undo stack
      undoStack.value.push(JSON.parse(JSON.stringify(currentState)));

      // Limit the size of undo stack
      if (undoStack.value.length > MAX_STATES) {
        undoStack.value.shift();
      }

      console.log(
        "State force saved. New undo stack size:",
        undoStack.value.length
      );
      console.log("=== END FORCE SAVING STATE ===");
    } else {
      console.log("State unchanged, skipping force save");
    }
  };

  // Function to undo last action
  const undo = () => {
    if (!canUndo.value) {
      console.log("Nothing to undo");
      return null;
    }

    console.log("=== UNDO OPERATION ===");
    console.log("Undo stack size before undo:", undoStack.value.length);
    console.log("Redo stack size before undo:", redoStack.value.length);

    isUndoRedoOperation.value = true;

    try {
      // Get the previous state
      const previousState = undoStack.value.pop();

      // Get current state for redo
      const currentState = getCurrentStateRef.value();

      // Add current state to redo stack
      redoStack.value.push(currentState);

      // Limit the size of redo stack
      if (redoStack.value.length > MAX_STATES) {
        redoStack.value.shift();
      }

      console.log(
        "Undo successful. New undo stack size:",
        undoStack.value.length
      );
      console.log("New redo stack size:", redoStack.value.length);
      console.log("=== END UNDO OPERATION ===");

      return previousState;
    } finally {
      isUndoRedoOperation.value = false;
    }
  };

  // Function to redo last undone action
  const redo = () => {
    if (!canRedo.value) {
      console.log("Nothing to redo");
      return null;
    }

    console.log("=== REDO OPERATION ===");
    console.log("Undo stack size before redo:", undoStack.value.length);
    console.log("Redo stack size before redo:", redoStack.value.length);

    isUndoRedoOperation.value = true;

    try {
      // Get the next state
      const nextState = redoStack.value.pop();

      // Get current state for undo
      const currentState = getCurrentStateRef.value();

      // Add current state to undo stack
      undoStack.value.push(currentState);

      // Limit the size of undo stack
      if (undoStack.value.length > MAX_STATES) {
        undoStack.value.shift();
      }

      console.log(
        "Redo successful. New undo stack size:",
        undoStack.value.length
      );
      console.log("New redo stack size:", redoStack.value.length);
      console.log("=== END REDO OPERATION ===");

      return nextState;
    } finally {
      isUndoRedoOperation.value = false;
    }
  };

  // Function to clear all history
  const clearHistory = () => {
    console.log("Clearing undo/redo history");
    undoStack.value = [];
    redoStack.value = [];

    // Clear any pending timeout
    if (saveTimeout) {
      clearTimeout(saveTimeout);
      saveTimeout = null;
    }
  };

  // Function to set the getCurrentState function
  const setGetCurrentStateFunction = (fn) => {
    getCurrentStateRef.value = fn;
  };

  return {
    // State
    undoStack,
    redoStack,
    isUndoRedoOperation,

    // Computed
    canUndo,
    canRedo,

    // Functions
    saveState,
    forceSaveState,
    undo,
    redo,
    clearHistory,
    setGetCurrentStateFunction,
  };
}
