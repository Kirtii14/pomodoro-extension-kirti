// ======================================================
// STORAGE LAYER
// Centralized Chrome storage management
// ======================================================

import {
  STORAGE_KEYS,
  DEFAULTS
} from "./constants.js";

// ------------------------------------------------------
// GENERIC HELPERS
// ------------------------------------------------------

function getFromStorage(key, fallback = null) {

  return new Promise((resolve) => {

    chrome.storage.local.get([key], (result) => {

      resolve(result[key] ?? fallback);
    });
  });
}

function setInStorage(data) {

  return new Promise((resolve) => {

    chrome.storage.local.set(data, () => {

      resolve(true);
    });
  });
}

// ======================================================
// TIMER STATE
// ======================================================

export async function saveTimerState(timerState) {

  return setInStorage({
    [STORAGE_KEYS.TIMER_STATE]: timerState
  });
}

export async function getTimerState() {

  return getFromStorage(
    STORAGE_KEYS.TIMER_STATE,
    {
      isRunning: false,
      endTime: null,
      mode: "work"
    }
  );
}

// ======================================================
// THEME
// ======================================================

export async function saveTheme(theme) {

  return setInStorage({
    [STORAGE_KEYS.THEME]: theme
  });
}

export async function getTheme() {

  return getFromStorage(
    STORAGE_KEYS.THEME,
    DEFAULTS.THEME
  );
}

// ======================================================
// SOUND
// ======================================================

export async function saveSoundSettings({
  muted,
  volume
}) {

  return setInStorage({

    [STORAGE_KEYS.SOUND_MUTED]: muted,

    [STORAGE_KEYS.SOUND_VOLUME]: volume
  });
}

export async function getSoundSettings() {

  const muted = await getFromStorage(
    STORAGE_KEYS.SOUND_MUTED,
    false
  );

  const volume = await getFromStorage(
    STORAGE_KEYS.SOUND_VOLUME,
    DEFAULTS.SOUND_VOLUME
  );

  return { muted, volume };
}

// ======================================================
// SESSION COUNTER
// ======================================================

export async function incrementCompletedSessions() {

  const current = await getFromStorage(
    STORAGE_KEYS.COMPLETED_SESSIONS,
    0
  );

  const updated = current + 1;

  await setInStorage({
    [STORAGE_KEYS.COMPLETED_SESSIONS]: updated
  });

  return updated;
}

export async function getCompletedSessions() {

  return getFromStorage(
    STORAGE_KEYS.COMPLETED_SESSIONS,
    0
  );
}