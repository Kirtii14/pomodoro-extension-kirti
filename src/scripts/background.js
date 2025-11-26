// background.js — Chrome Extension Service Worker
// This ensures the timer continues even if the popup closes.

let timerState = {
  isRunning: false,
  endTime: null,
  mode: "work" // work | shortBreak | longBreak
};

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "START_TIMER") {
    const durationMs = msg.duration * 60 * 1000; // minutes → ms
    timerState.isRunning = true;
    timerState.endTime = Date.now() + durationMs;
    timerState.mode = msg.mode;

    chrome.alarms.create("POMODORO_TIMER", {
      when: timerState.endTime
    });

    sendResponse({ status: "started" });
  }

  if (msg.action === "STOP_TIMER") {
    timerState.isRunning = false;
    timerState.endTime = null;
    chrome.alarms.clear("POMODORO_TIMER");
    sendResponse({ status: "stopped" });
  }

  if (msg.action === "GET_STATE") {
    sendResponse(timerState);
  }
});

// When alarm triggers → session completed
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "POMODORO_TIMER") {
    timerState.isRunning = false;

    // Notify popup to play sound
    chrome.runtime.sendMessage({
      action: "TIMER_FINISHED",
      mode: timerState.mode
    });

    // Desktop notification
    chrome.notifications.create({
      type: "basic",
      iconUrl: "assets/icons/icon128.png",
      title: "Pomodoro Completed!🍅",
      message: timerState.mode === "work"
        ? "Your focus session is finished. Time for a break!"
        : "Break finished! Ready to focus again?",
      priority: 2
    });
  }
});
