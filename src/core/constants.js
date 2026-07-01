// ======================================================
// APPLICATION CONSTANTS
// Centralized configuration for scalability & consistency
// ======================================================

export const TIMER_MODES = Object.freeze({
  WORK: "work",
  SHORT_BREAK: "shortBreak",
  LONG_BREAK: "longBreak"
});

export const DEFAULTS = Object.freeze({
  WORK_DURATION: 25,
  SHORT_BREAK_DURATION: 5,
  LONG_BREAK_DURATION: 15,
  SOUND_VOLUME: 0.6,
  THEME: "light"
});

export const STORAGE_KEYS = Object.freeze({
  TIMER_STATE: "timerState",
  TOTAL_DURATION: "totalDurationMs",
  THEME: "theme",
  SOUND_MUTED: "soundMuted",
  SOUND_VOLUME: "soundVolume",
  COMPLETED_SESSIONS: "completedSessions"
});

export const ALARM_NAMES = Object.freeze({
  POMODORO: "POMODORO_TIMER"
});

export const TIMER_LIMITS = Object.freeze({
  MIN_DURATION: 1,
  MAX_DURATION: 180
});