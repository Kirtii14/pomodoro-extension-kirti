// popup.js
// Handles UI + messaging with background.js
// Timer does NOT run here. Background handles actual timing.
// Popup only displays remaining time & sends commands.

// Elements
const timerEl = document.getElementById("timer");
const startBtn = document.getElementById("start");
const pauseBtn = document.getElementById("pause");
const resetBtn = document.getElementById("reset");

const workInput = document.getElementById("workTime");
const shortBreakInput = document.getElementById("shortBreak");

const ring = document.querySelector(".ring-progress");
const RING_LENGTH = 502;

const modeWorkEl = document.getElementById("mode-work");
const modeBreakEl = document.getElementById("mode-break");

const focusBtn = document.getElementById("focusMode");
const closeFocusBtn = document.getElementById("closeFocus");


   //STATE

let intervalUI = null;
let bgState = null;
let totalDurationMs = 0;
let focusWindowId = null;


   //UTILITIES

function formatTime(ms) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const min = Math.floor(totalSec / 60).toString().padStart(2, "0");
  const sec = (totalSec % 60).toString().padStart(2, "0");
  return `${min}:${sec}`;
}

function setMode(mode) {
  if (!modeWorkEl || !modeBreakEl) return;

  if (mode === "work") {
    modeWorkEl.classList.add("active");
    modeBreakEl.classList.remove("active");
  } else {
    modeWorkEl.classList.remove("active");
    modeBreakEl.classList.add("active");
  }
}


   //UI UPDATER

function startUIUpdater() {
  if (intervalUI) return;

  intervalUI = setInterval(() => {
    chrome.runtime.sendMessage({ action: "GET_STATE" }, (state) => {
      if (!state) return;

      bgState = state;

      if (!state.isRunning) {
        clearInterval(intervalUI);
        intervalUI = null;
      }

      if (state.endTime) {
        const remaining = state.endTime - Date.now();
        timerEl.textContent = formatTime(remaining);

        if (ring && totalDurationMs > 0) {
          const progress = Math.max(0, remaining / totalDurationMs);
          ring.style.strokeDashoffset = RING_LENGTH * progress;
        }

        if (remaining <= 0) {
          timerEl.textContent = "00:00";
          if (ring) ring.style.strokeDashoffset = RING_LENGTH;
        }
      }
    });
  }, 1000);
}

   //START TIMER

if (startBtn) {
  startBtn.addEventListener("click", () => {
    const duration = Number(workInput.value);
    totalDurationMs = duration * 60 * 1000;

    chrome.storage.local.set({ totalDurationMs });

    setMode("work");

    chrome.runtime.sendMessage(
      { action: "START_TIMER", duration, mode: "work" },
      () => startUIUpdater()
    );
  });
}


   //PAUSE TIMER

if (pauseBtn) {
  pauseBtn.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "STOP_TIMER" }, () => {
      clearInterval(intervalUI);
      intervalUI = null;
    });
  });
}


   //RESET TIMER

if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "STOP_TIMER" }, () => {
      clearInterval(intervalUI);
      intervalUI = null;

      timerEl.textContent = `${workInput.value.padStart(2, "0")}:00`;
      if (ring) ring.style.strokeDashoffset = RING_LENGTH;

      setMode("work");
    });
  });
}


  // FOCUS MODE WINDOW

if (focusBtn) {
  focusBtn.addEventListener("click", () => {
    if (focusWindowId !== null) return;

    chrome.windows.create(
      {
        url: "focus.html",
        type: "popup",
        width: 360,
        height: 480,
        focused: true
      },
      (win) => {
        focusWindowId = win.id;
      }
    );
  });
}

if (closeFocusBtn) {
  closeFocusBtn.addEventListener("click", () => {
    focusWindowId = null;
    window.close();
  });
}


   //SYNC ON POPUP OPEN

chrome.storage.local.get(["totalDurationMs"], (res) => {
  if (res.totalDurationMs) {
    totalDurationMs = res.totalDurationMs;
  }
});

chrome.runtime.sendMessage({ action: "GET_STATE" }, (state) => {
  if (!state) return;

  bgState = state;

  if (state.isRunning && state.endTime) {
    setMode(state.mode);
    startUIUpdater();
  } else {
    setMode("work");
    timerEl.textContent = `${workInput.value.padStart(2, "0")}:00`;
    if (ring) ring.style.strokeDashoffset = RING_LENGTH;
  }
});


   //LISTEN FOR COMPLETION

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "TIMER_FINISHED") {
    timerEl.textContent = "00:00";
    if (ring) ring.style.strokeDashoffset = RING_LENGTH;

    setMode(msg.mode === "work" ? "break" : "work");

    const current =
      Number(localStorage.getItem("pomodoro.completed")) || 0;
    localStorage.setItem("pomodoro.completed", current + 1);
  }
});


   //SOUND PREFERENCES

const muteCheckbox = document.getElementById("muteSound");
const volumeSlider = document.getElementById("volumeControl");

chrome.storage.local.get(["soundMuted", "soundVolume"], (res) => {
  if (muteCheckbox) muteCheckbox.checked = res.soundMuted ?? false;
  if (volumeSlider) volumeSlider.value = res.soundVolume ?? 0.6;
});

if (muteCheckbox) {
  muteCheckbox.addEventListener("change", () => {
    chrome.storage.local.set({ soundMuted: muteCheckbox.checked });
  });
}

if (volumeSlider) {
  volumeSlider.addEventListener("input", () => {
    chrome.storage.local.set({
      soundVolume: Number(volumeSlider.value)
    });
  });
}

