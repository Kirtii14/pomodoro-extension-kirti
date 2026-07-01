// ======================================================
// VALIDATION UTILITIES
// Reusable defensive validation helpers
// ======================================================

import {
  TIMER_LIMITS,
  DEFAULTS
} from "./constants.js";

// ======================================================
// SAFE NUMBER
// ======================================================

export function toSafeNumber(value, fallback = 0) {

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return parsed;
}

// ======================================================
// CLAMP
// ======================================================

export function clamp(value, min, max) {

  return Math.min(
    Math.max(value, min),
    max
  );
}

// ======================================================
// TIMER DURATION
// ======================================================

export function validateDuration(value, fallback) {

  const safeValue = toSafeNumber(
    value,
    fallback
  );

  return clamp(
    Math.floor(safeValue),
    TIMER_LIMITS.MIN_DURATION,
    TIMER_LIMITS.MAX_DURATION
  );
}

// ======================================================
// VOLUME
// ======================================================

export function validateVolume(value) {

  const safeValue = toSafeNumber(
    value,
    DEFAULTS.SOUND_VOLUME
  );

  return clamp(safeValue, 0, 1);
}

// ======================================================
// BOOLEAN
// ======================================================

export function toBoolean(value) {

  return Boolean(value);
}