// popup.js
// Handles UI + messaging with background.js
// Timer does NOT run here. Background handles actual timing.
// Popup only displays remaining time & sends commands.

// Elements
const timerEl = document.getElementById("timer");
const startBtn = document.getElementById("start");
const pauseBtn = document.getElementById("pause");
const resetBtn = document.getElementById("reset");

// Inputs
const workInput = document.getElementById("workTime");
const shortBreakInput = document.getElementById("shortBreak");

// State
let intervalUI = null;
let bgState = null;


// Utility: Format mm:ss

function formatTime(ms) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const min = Math.floor(totalSec / 60).toString().padStart(2, "0");
  const sec = (totalSec % 60).toString().padStart(2, "0");
  return `${min}:${sec}`;
}


// Update UI every second

function startUIUpdater() {
  if (intervalUI) return;

  intervalUI = setInterval(() => {
    chrome.runtime.sendMessage({ action: "GET_STATE" }, (state) => {
      bgState = state;

      if (!state.isRunning) {
        clearInterval(intervalUI);
        intervalUI = null;
      }

      if (state.endTime) {
        const remaining = state.endTime - Date.now();
        timerEl.textContent = formatTime(remaining);

        // Timer ended: display 00:00
        if (remaining <= 0) {
          timerEl.textContent = "00:00";
        }
      }
    });
  }, 1000);
}

// Start timer

startBtn.addEventListener("click", () => {
  const duration = Number(workInput.value);
  chrome.runtime.sendMessage(
    { action: "START_TIMER", duration: duration, mode: "work" },
    () => startUIUpdater()
  );
});


// Pause timer

pauseBtn.addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "STOP_TIMER" }, () => {
    clearInterval(intervalUI);
    intervalUI = null;
  });
});


// Reset timer

resetBtn.addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "STOP_TIMER" }, () => {
    clearInterval(intervalUI);
    intervalUI = null;
    timerEl.textContent = `${workInput.value.padStart(2, "0")}:00`;
  });
});


// When popup opens — sync immediately

chrome.runtime.sendMessage({ action: "GET_STATE" }, (state) => {
  bgState = state;

  if (state.isRunning && state.endTime) {
    startUIUpdater();
  } else {
    timerEl.textContent = `${workInput.value.padStart(2, "0")}:00`;
  }
});


// Listen for TIMER_FINISHED from background

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "TIMER_FINISHED") {
    timerEl.textContent = "00:00";

    // Play sound (from sound.js)
    if (msg.mode === "work") playSound("workEnd");
    if (msg.mode === "shortBreak") playSound("breakEnd");
    if (msg.mode === "longBreak") playSound("longBreakEnd");

    // Increase completed counter
    const current = Number(localStorage.getItem("pomodoro.completed") || 0);
    localStorage.setItem("pomodoro.completed", current + 1);
  }
});
