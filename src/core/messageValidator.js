// ======================================================
// MESSAGE VALIDATION
// Defensive runtime message validation
// ======================================================

import {
  MESSAGES,
} from "./messages.js";

import {
  TIMER_MODES
} from "./constants.js";

// ======================================================
// VALID ACTIONS
// ======================================================

const VALID_ACTIONS = new Set([
  MESSAGES.START_TIMER,
  MESSAGES.STOP_TIMER,
  MESSAGES.GET_STATE,
  MESSAGES.TIMER_FINISHED
]);

// ======================================================
// VALIDATE MESSAGE
// ======================================================

export function validateMessage(message) {

  if (!message || typeof message !== "object") {

    return {
      valid: false,
      error: "Message must be an object"
    };
  }

  // --------------------------------------------------
  // ACTION
  // --------------------------------------------------

  if (!VALID_ACTIONS.has(message.action)) {

    return {
      valid: false,
      error: "Invalid message action"
    };
  }

  // --------------------------------------------------
  // START TIMER VALIDATION
  // --------------------------------------------------

  if (message.action === MESSAGES.START_TIMER) {

    const validModes = Object.values(TIMER_MODES);

    if (
      typeof message.duration !== "number"
    ) {

      return {
        valid: false,
        error: "Invalid timer duration"
      };
    }

    if (!validModes.includes(message.mode)) {

      return {
        valid: false,
        error: "Invalid timer mode"
      };
    }
  }

  return {
    valid: true
  };
}