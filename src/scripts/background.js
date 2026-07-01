// ======================================================
// BACKGROUND SERVICE WORKER
// Thin orchestration layer
// ======================================================

import { MESSAGES } from "../core/messages.js";

import {
  ALARM_NAMES,
  TIMER_MODES,
  AUTO_DURATIONS
} from "../core/constants.js";


import {

  initializeTimerState,

  recoverTimerIfNeeded,

  getCurrentTimerState,

  startTimer,

  stopTimer,

  completeTimer,

  getNextSessionMode

} from "../core/timer.js";

import {
  validateMessage
} from "../core/messageValidator.js";

// ======================================================
// INITIALIZATION
// ======================================================

(async function bootstrap() {

  try {

    await initializeTimerState();

    await recoverTimerIfNeeded();

  } catch (error) {

    console.error("Background initialization failed:", error);
  }

})();

// ======================================================
// MESSAGE ROUTER
// ======================================================

chrome.runtime.onMessage.addListener(
  (message, sender, sendResponse) => {

    handleMessage(message)

      .then(sendResponse)

      .catch((error) => {

        console.error("Message handling failed:", error );

        sendResponse({
          success: false,
          error: "Internal background error"
        });
      });

    return true;
  }
);

// ======================================================
// MESSAGE HANDLER
// ======================================================

async function handleMessage(message) {

  // ----------------------------------------------------
  // VALIDATE MESSAGE
  // ----------------------------------------------------

  const validation = validateMessage(message);

  if (!validation.valid) {

    return {

      success: false,
      error:validation.error
    };
  }

  // ----------------------------------------------------
  // ROUTE MESSAGE
  // ----------------------------------------------------

  switch (message.action) {

    // ==================================================
    // START TIMER
    // ==================================================

    case MESSAGES.START_TIMER: {

      await startTimer({

        duration: message.duration,
        mode: message.mode
      });

      return {

        success: true,

        status:
          "started"
      };
    }

    // ==================================================
    // STOP TIMER
    // ==================================================

    case MESSAGES.STOP_TIMER: {

      await stopTimer();

      return {

        success: true,
        status: "stopped"
      };
    }

    // ==================================================
    // GET STATE
    // ==================================================

    case MESSAGES.GET_STATE: {

      return {

        success: true,
        data: getCurrentTimerState()
      };
    }

    // ==================================================
    // UNKNOWN ACTION
    // ==================================================

    default:

      return {

        success: false,
        error: "Unknown message action"
      };
  }
}

// ======================================================
// ALARM HANDLER
// ======================================================

chrome.alarms.onAlarm.addListener(
  async (alarm) => {

    // --------------------------------------------------
    // IGNORE UNKNOWN ALARMS
    // --------------------------------------------------

    if (alarm.name !== ALARM_NAMES.POMODORO) {
      return;
    }

    try {

      // ----------------------------------------------
      // COMPLETE TIMER
      // ----------------------------------------------

      const state =
        await completeTimer();

      // ----------------------------------------------
      // VALIDATE COMPLETED STATE
      // ----------------------------------------------

      if (!state?.mode) {

        console.warn("Timer completed with invalid state");

        return;
      }

        
    // DETERMINE NEXT SESSION
    

    const nextMode = getNextSessionMode(state);

    
    // AUTO START NEXT SESSION

    const nextDuration = nextMode === TIMER_MODES.WORK

        ? AUTO_DURATIONS.WORK

        : nextMode === TIMER_MODES.LONG_BREAK

          ? AUTO_DURATIONS.LONG_BREAK

          : AUTO_DURATIONS.SHORT_BREAK;

      await startTimer({ duration: nextDuration,mode: nextMode});

      // ----------------------------------------------
      // NOTIFY UI
      // ----------------------------------------------

      chrome.runtime.sendMessage({

        action: MESSAGES.TIMER_FINISHED,
        mode: nextMode
      });

      // ----------------------------------------------
      // DESKTOP NOTIFICATION
      // ----------------------------------------------

      chrome.notifications.create({

        type: "basic",
        iconUrl: "assets/icons/icon128.png",
        title: "Pomodoro Completed 🍅",

        message:

           nextMode === TIMER_MODES.WORK

                  ? "Break finished. Time to focus."

                  : nextMode === TIMER_MODES.LONG_BREAK

                    ? "Great work. Long break started."

                    : "Focus session completed. Short break started.",

        priority: 2 });

    } catch (error) {

      console.error("Alarm handling failed:", error);
    }
  }
);