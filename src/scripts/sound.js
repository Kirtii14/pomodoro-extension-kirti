// sound.js — plays sounds when timer finishes

const sounds = {
  workEnd: new Audio("assets/sounds/work-end.mp3"),
  breakEnd: new Audio("assets/sounds/break-end.mp3"),
  longBreakEnd: new Audio("assets/sounds/long-break-end.mp3")
};

function playSound(type) {
  if (sounds[type]) {
    sounds[type].currentTime = 0;
    sounds[type].play();
  }
}

// Receive message from background service worker
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "TIMER_FINISHED") {
    if (msg.mode === "work") playSound("workEnd");
    if (msg.mode === "shortBreak") playSound("breakEnd");
    if (msg.mode === "longBreak") playSound("longBreakEnd");
  }
});
