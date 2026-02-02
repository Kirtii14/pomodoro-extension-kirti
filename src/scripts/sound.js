// sound.js
// Handles all audio playback + mute + volume

const DEFAULT_VOLUME = 0.6;

const sounds = {
  work: new Audio("assets/sounds/work-end.mp3"),
  shortBreak: new Audio("assets/sounds/break-end.mp3"),
  longBreak: new Audio("assets/sounds/long-break-end.mp3")
};

// Load preferences
function loadAudioPrefs() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["soundMuted", "soundVolume"], (res) => {
      resolve({
        muted: res.soundMuted ?? false,
        volume: res.soundVolume ?? DEFAULT_VOLUME
      });
    });
  });
}

// Apply preferences to all sounds
async function applyAudioPrefs() {
  const { muted, volume } = await loadAudioPrefs();
  Object.values(sounds).forEach(audio => {
    audio.volume = muted ? 0 : volume;
  });
}

// Play sound safely
async function playSound(type) {
  await applyAudioPrefs();

  const audio = sounds[type];
  if (!audio) return;

  try {
    audio.currentTime = 0;
    await audio.play();
  } catch (err) {
    // Chrome may block autoplay — ignore silently
    console.warn("Sound blocked:", err);
  }
}

// Listen for timer completion
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "TIMER_FINISHED") {
    if (msg.mode === "work") playSound("work");
    if (msg.mode === "shortBreak") playSound("shortBreak");
    if (msg.mode === "longBreak") playSound("longBreak");
  }
});
