// ======================================================
// SOUND ENGINE
// Handles audio playback & preferences
// ======================================================

import {
  MESSAGES
} from "../core/messages.js";

import {
  TIMER_MODES
} from "../core/constants.js";

import {
  getSoundSettings
} from "../core/storage.js";

// ======================================================
// AUDIO FILES
// ======================================================

const sounds = {

  [TIMER_MODES.WORK]:

    new Audio(
      "../assets/sounds/work-end.mp3"
    ),

  [TIMER_MODES.SHORT_BREAK]:

    new Audio(
      "../assets/sounds/break-end.mp3"
    ),

  [TIMER_MODES.LONG_BREAK]:

    new Audio(
      "../assets/sounds/long-break-end.mp3"
    )
};

// ======================================================
// APPLY SOUND SETTINGS
// ======================================================

async function applySoundPreferences() {

  const {
    muted,
    volume
  } = await getSoundSettings();

  Object.values(sounds)
    .forEach((audio) => {

      audio.volume =
        muted ? 0 : volume;
    });
}

// ======================================================
// PLAY SOUND
// ======================================================

async function playSound(mode) {

  const audio =
    sounds[mode];

  if (!audio) {
    return;
  }

  await applySoundPreferences();

  try {

    audio.currentTime = 0;

    await audio.play();

  } catch (error) {

    console.warn(
      "Audio playback blocked:",
      error
    );
  }
}

// ======================================================
// TIMER COMPLETION LISTENER
// ======================================================

chrome.runtime.onMessage.addListener(
  async (message) => {

    if (
      message.action !==
      MESSAGES.TIMER_FINISHED
    ) {
      return;
    }

    await playSound(
      message.mode
    );
  }
);