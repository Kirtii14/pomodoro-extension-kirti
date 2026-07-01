// ======================================================
// THEME ENGINE
// Handles theme synchronization & UI updates
// ======================================================

import {
  DEFAULTS
} from "../core/constants.js";

import {
  getTheme,
  saveTheme
} from "../core/storage.js";

// ======================================================
// ELEMENTS
// ======================================================

const themeToggleBtn =
  document.getElementById(
    "themeToggle"
  );

// ======================================================
// APPLY THEME
// ======================================================

function applyTheme(theme) {

  const isDarkTheme =
    theme === "dark";

  document.body.classList.toggle(
    "dark",
    isDarkTheme
  );

  if (themeToggleBtn) {

    themeToggleBtn.textContent =
      isDarkTheme
        ? "☀️"
        : "🌙";
  }
}

// ======================================================
// INITIALIZE THEME
// ======================================================

async function initializeTheme() {

  const savedTheme =
    await getTheme();

  applyTheme(
    savedTheme ||
    DEFAULTS.THEME
  );
}

initializeTheme();

// ======================================================
// TOGGLE THEME
// ======================================================

if (themeToggleBtn) {

  themeToggleBtn.addEventListener(

    "click",

    async () => {

      const isCurrentlyDark =
        document.body.classList.contains(
          "dark"
        );

      const nextTheme =
        isCurrentlyDark
          ? "light"
          : "dark";

      await saveTheme(
        nextTheme
      );

      applyTheme(
        nextTheme
      );
    }
  );
}