// theme.js
// Handles dark/light mode toggle + persistence

const themeToggleBtn = document.getElementById("themeToggle");

// Apply theme to body
function applyTheme(theme) {
  document.body.classList.toggle("dark", theme === "dark");
  themeToggleBtn.textContent = theme === "dark" ? "☀️" : "🌙";
}

// Load saved theme on popup open
chrome.storage.local.get(["theme"], (result) => {
  const savedTheme = result.theme || "light";
  applyTheme(savedTheme);
});

// Toggle theme
themeToggleBtn.addEventListener("click", () => {
  chrome.storage.local.get(["theme"], (result) => {
    const newTheme = result.theme === "dark" ? "light" : "dark";
    chrome.storage.local.set({ theme: newTheme });
    applyTheme(newTheme);
  });
});
