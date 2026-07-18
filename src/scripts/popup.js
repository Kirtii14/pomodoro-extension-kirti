// ======================================================
// POPUP UI CONTROLLER
// UI layer only — no timer business logic
// ======================================================

import {
  MESSAGES
} from "../core/messages.js";

import {
  TIMER_MODES,
  DEFAULTS
} from "../core/constants.js";

import {
  validateDuration,
  validateVolume
} from "../core/validation.js";

import {

  getSoundSettings,
  saveSoundSettings,
  incrementCompletedSessions

} from "../core/storage.js";

// ======================================================
// ELEMENTS
// ======================================================

const timerEl =
  document.getElementById("timer");

const startBtn =
  document.getElementById("start");

const pauseBtn =
  document.getElementById("pause");

const resetBtn =
  document.getElementById("reset");

const workInput =
  document.getElementById("workTime");

const shortBreakInput =
  document.getElementById("shortBreak");

const ring =
  document.querySelector(".ring-progress");

const modeWorkEl =
  document.getElementById("mode-work");

const modeBreakEl =
  document.getElementById("mode-break");

const focusBtn =
  document.getElementById("focusMode");

const closeFocusBtn =
  document.getElementById("closeFocus");

const muteCheckbox =
  document.getElementById("muteSound");

const volumeSlider =
  document.getElementById("volumeControl");

// ======================================================
// CONSTANTS
// ======================================================

const RING_LENGTH = 628;

// ======================================================
// LOCAL UI STATE
// ======================================================

let intervalUI = null;
let totalDurationMs = 0;
let focusWindowId = null;
let lastRenderedTime = null;
let lastRenderedProgress = null;


// ======================================================
// UTILITIES
// ======================================================

function formatTime(ms) {

  const totalSeconds =
    Math.max(
      0,
      Math.floor(ms / 1000)
    );

  const minutes =
    Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");

  const seconds =
    (totalSeconds % 60)
      .toString()
      .padStart(2, "0");

  return `${minutes}:${seconds}`;
}

// ======================================================
// MODE UI
// ======================================================

function setMode(mode) {

  if (!modeWorkEl || !modeBreakEl) {
    return;
  }

  const isWorkMode =
    mode === TIMER_MODES.WORK;

  modeWorkEl.classList.toggle(
    "active",
    isWorkMode
  );

  modeBreakEl.classList.toggle(
    "active",
    !isWorkMode
  );
}

// ======================================================
// TIMER DISPLAY
// ======================================================
function updateTimerUI(remainingMs) {

  const formattedTime = formatTime(remainingMs);

  // --------------------------------------------------
  // PREVENT UNNECESSARY TEXT RENDERS
  // --------------------------------------------------

  if (formattedTime !== lastRenderedTime) {

    timerEl.textContent = formattedTime;

    lastRenderedTime = formattedTime;
  }

  // --------------------------------------------------
  // PROGRESS RING
  // --------------------------------------------------

  if (ring && totalDurationMs > 0) {

    const progress = Math.max(
        0,
        remainingMs / totalDurationMs
      );

    const dashOffset = RING_LENGTH * progress;

    // ----------------------------------------------
    // PREVENT UNNECESSARY SVG REPAINTS
    // ----------------------------------------------

    if (dashOffset !== lastRenderedProgress) {

      ring.style.strokeDashoffset = dashOffset;

      lastRenderedProgress = dashOffset;
    }
  }

  // --------------------------------------------------
  // TIMER COMPLETE
  // --------------------------------------------------

  if (remainingMs <= 0) {

    timerEl.textContent = "00:00";

    lastRenderedTime = "00:00";
    if (ring) {

      ring.style.strokeDashoffset = RING_LENGTH;

      lastRenderedProgress = RING_LENGTH;
    }
  }
}
// ======================================================
// UI SYNC LOOP
// ======================================================

function stopUIUpdater() {

  clearInterval(intervalUI);

  intervalUI = null;
}

function startUIUpdater() {

  if (intervalUI) {
    return;
  }

  intervalUI = setInterval(
    () => {
      
      if (document.hidden) {
          return;
        }

      chrome.runtime.sendMessage(

        {
          action: MESSAGES.GET_STATE
        },

        (response) => {

          if (!response?.success) {

            console.error(response?.error || "Failed to fetch timer state");

            return;
          }

          const state = response.data;

          if (!state) {
            return;
          }

          if (
            !state.isRunning
          ) {

            stopUIUpdater();

            return;
          }

          if (state.endTime) {

            const remainingMs = state.endTime - Date.now();

            updateTimerUI(remainingMs);
          }
        }
      );
    },

    1000
  );
}

// ======================================================
// START TIMER
// ======================================================

if (startBtn) {

  startBtn.addEventListener("click", () => {

      const duration = validateDuration(
    workInput?.value || DEFAULTS.WORK_DURATION,
    DEFAULTS.WORK_DURATION
);
      totalDurationMs = duration * 60 * 1000;

      setMode(TIMER_MODES.WORK);

      chrome.runtime.sendMessage(

        {
          action: MESSAGES.START_TIMER,
          duration,
          mode: TIMER_MODES.WORK
        },

        (response) => {

          if (
            !response?.success
          ) {

            console.error(response?.error || "Failed to start timer" );
            return;
          }

          startUIUpdater();
        }
      );
    }
  );
}

// ======================================================
// PAUSE TIMER
// ======================================================

if (pauseBtn) {

  pauseBtn.addEventListener("click", () => {

      chrome.runtime.sendMessage(

        {
          action: MESSAGES.STOP_TIMER
        },

        (response) => {

          if (!response?.success) {

            console.error(response?.error || "Failed to stop timer");

            return;
          }

          stopUIUpdater();
        }
      );
    }
  );
}

// ======================================================
// RESET TIMER
// ======================================================

if (resetBtn) {

  resetBtn.addEventListener("click", () => {

      chrome.runtime.sendMessage(

        {
          action: MESSAGES.STOP_TIMER
        },

        (response) => {

          if (!response?.success) {

            console.error(response?.error ||"Failed to reset timer");

            return;
          }

          stopUIUpdater();

          const safeDuration = validateDuration(
              workInput?.value || DEFAULTS.WORK_DURATION,
              DEFAULTS.WORK_DURATION
          );

          timerEl.textContent =`${String(safeDuration).padStart(2, "0")}:00`;

          if (ring) {

              ring.style.strokeDashoffset = RING_LENGTH;
            }

            lastRenderedTime = null;
            lastRenderedProgress = null;

          setMode(TIMER_MODES.WORK);
        }
      );
    }
  );
}

// ======================================================
// FOCUS MODE WINDOW
// ======================================================

if (focusBtn) {

  focusBtn.addEventListener(
    "click",

    () => {

      if (
        focusWindowId !== null
      ) {
        return;
      }

      chrome.windows.create(

        {
          url: "focus.html",
          type: "popup",
          width: 520,
          height: 760,
          focused: true
        },

        (windowRef) => {

          focusWindowId = windowRef.id;
        }
      );
    }
  );
}

// ======================================================
// CLOSE FOCUS MODE
// ======================================================

if (closeFocusBtn) {

  closeFocusBtn.addEventListener(
    "click",

    () => {

      focusWindowId = null;

      window.close();
    }
  );
}

// ======================================================
// INITIAL UI
// ======================================================

function initializeDefaultUI() {

const safeDuration = validateDuration(
    workInput?.value || DEFAULTS.WORK_DURATION,
    DEFAULTS.WORK_DURATION
);

  timerEl.textContent =  `${String(safeDuration).padStart(2, "0")}:00`;

      lastRenderedTime = timerEl.textContent;

  if (ring) {

    ring.style.strokeDashoffset = RING_LENGTH;
    lastRenderedProgress = RING_LENGTH;
  }

  setMode(
    TIMER_MODES.WORK
  );
}

// ======================================================
// INITIAL STATE SYNC
// ======================================================

chrome.runtime.sendMessage(

  {
    action:
      MESSAGES.GET_STATE
  },

  (response) => {

    if (
      !response?.success
    ) {

      initializeDefaultUI();

      return;
    }

    const state =
      response.data;

    if (
      state?.isRunning &&
      state?.endTime
    ) {

      setMode(state.mode);

      totalDurationMs = state.durationMs || 0;

      startUIUpdater();

    } else {

      initializeDefaultUI();
    }
  }
);

// ======================================================
// TIMER COMPLETION LISTENER
// ======================================================

chrome.runtime.onMessage.addListener(

  async (message) => {

    if (
      message.action !==  MESSAGES.TIMER_FINISHED
    ) {
      return;
    }

    timerEl.textContent = "00:00";
    lastRenderedTime = "00:00";

   if (ring) {

      ring.style.strokeDashoffset = RING_LENGTH;

      lastRenderedProgress = RING_LENGTH;
    }
    setMode(

      message.mode === TIMER_MODES.WORK

        ? TIMER_MODES.SHORT_BREAK

        : TIMER_MODES.WORK
    );

    await incrementCompletedSessions();
  }
);

// ======================================================
// SOUND SETTINGS
// ======================================================

async function initializeSoundSettings() {

  const {
    muted,
    volume
  } = await getSoundSettings();

  if (muteCheckbox) {

    muteCheckbox.checked =
      muted;
  }

  if (volumeSlider) {

    volumeSlider.value =
      volume;
  }
}

initializeSoundSettings();

// ------------------------------------------------------
// MUTE
// ------------------------------------------------------

if (muteCheckbox) {

  muteCheckbox.addEventListener(

    "change",

    async () => {

      const volume =
        validateVolume(
          volumeSlider.value
        );

      await saveSoundSettings({

        muted:
          muteCheckbox.checked,

        volume
      });
    }
  );
}

// ------------------------------------------------------
// VOLUME
// ------------------------------------------------------

if (volumeSlider) {

  volumeSlider.addEventListener(

    "input",

    async () => {

      const volume =
        validateVolume(
          volumeSlider.value
        );

      await saveSoundSettings({

        muted:
          muteCheckbox.checked,

        volume
      });
    }
  );
}

// ======================================================
// CLEANUP
// ======================================================

window.addEventListener(
  "beforeunload",

  () => {

    stopUIUpdater();
  }
);