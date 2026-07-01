// ======================================================
// TIMER ENGINE
// Authoritative timer lifecycle management
// ======================================================

import {
  TIMER_MODES,
  ALARM_NAMES
} from "./constants.js";

import {
  saveTimerState,
  getTimerState
} from "./storage.js";

// ======================================================
// DEFAULT TIMER STATE
// ======================================================

function createDefaultState() {

  return {

    isRunning: false,
    startTime: null,
    endTime: null,
    durationMs: null,
    mode: TIMER_MODES.WORK,
    completedWorkSessions: 0
  };
}
// ======================================================
// CURRENT TIMER STATE
// ======================================================

let timerState = createDefaultState();

// ======================================================
// INITIALIZE
// ======================================================

export async function initializeTimerState() {

  const savedState = await getTimerState();
  timerState = savedState || createDefaultState();
  return timerState;
}

// ======================================================
// GET STATE
// ======================================================

export function getCurrentTimerState() {

  return structuredClone(timerState);
}

// ======================================================
// START TIMER
// ======================================================

export async function startTimer({
  duration,
  mode
}) {

  const durationMs =
    duration * 60 * 1000;

  const startTime =
    Date.now();

  const endTime =
    startTime + durationMs;

 timerState = {

  ...timerState,

  isRunning: true,

  startTime,

  endTime,

  durationMs,

  mode
};
  chrome.alarms.create(
    ALARM_NAMES.POMODORO,
    {
      when: endTime
    }
  );

  await saveTimerState(
    timerState
  );

  return getCurrentTimerState();
}

// ======================================================
// STOP TIMER
// ======================================================

export async function stopTimer() {

  chrome.alarms.clear(
    ALARM_NAMES.POMODORO
  );

  timerState = {

    ...createDefaultState()
  };

  await saveTimerState(
    timerState
  );

  return getCurrentTimerState();
}
// ======================================================
// COMPLETE TIMER
// ======================================================

export async function completeTimer() {

  const completedWorkSessions = timerState.mode === TIMER_MODES.WORK

      ? timerState.completedWorkSessions + 1

      : timerState.completedWorkSessions;

  timerState = {

    ...timerState,

    isRunning: false,

    completedWorkSessions};

  await saveTimerState(timerState);

  return getCurrentTimerState();
}


// ======================================================
// GET NEXT SESSION MODE
// ======================================================

export function getNextSessionMode(state) {

  if (state.mode === TIMER_MODES.WORK) {

    const completedSessions = state.completedWorkSessions;
    const shouldStartLongBreak = completedSessions % 4 === 0;

    return shouldStartLongBreak

      ? TIMER_MODES.LONG_BREAK

      : TIMER_MODES.SHORT_BREAK;
  }

  return TIMER_MODES.WORK;
}

// ======================================================
// GET ACTIVE ALARM
// ======================================================

function getAlarm(name) {

  return new Promise((resolve) => {

    chrome.alarms.get(
      name,
      resolve
    );
  });
}

// ======================================================
// RECOVERY CHECK
// ======================================================

export async function recoverTimerIfNeeded() {

  const state = await getTimerState();

  // --------------------------------------------------
  // INVALID STATE
  // --------------------------------------------------

  if (!state || typeof state !== "object" ) {

    timerState = createDefaultState();
    await saveTimerState(timerState);
    return timerState;
  }

  // --------------------------------------------------
  // NOT RUNNING
  // --------------------------------------------------

  if (!state.isRunning) {

    chrome.alarms.clear(ALARM_NAMES.POMODORO);
    timerState = state;
    return state;
  }

  // --------------------------------------------------
  // INVALID TIMER DATA
  // --------------------------------------------------

  if (!state.endTime ||!state.durationMs ||!state.mode) {

    timerState = createDefaultState();
    await saveTimerState(timerState);
    chrome.alarms.clear(ALARM_NAMES.POMODORO);
    return timerState;
  }

  // --------------------------------------------------
  // TIMER ALREADY EXPIRED
  // --------------------------------------------------

  const now = Date.now();

  if (state.endTime <= now) {
    timerState = state;
    await completeTimer();
    chrome.alarms.clear( ALARM_NAMES.POMODORO);
    return getCurrentTimerState();
  }

  // --------------------------------------------------
  // VERIFY ACTIVE ALARM
  // --------------------------------------------------

  const existingAlarm = await getAlarm(ALARM_NAMES.POMODORO);

  // --------------------------------------------------
  // RECREATE MISSING ALARM
  // --------------------------------------------------

  if (!existingAlarm) {

    chrome.alarms.create(

      ALARM_NAMES.POMODORO,

      {
        when:
          state.endTime
      }
    );
  }

  timerState = state;

  return state;
}