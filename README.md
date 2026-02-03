# 🍅 Pomodoro Focus – Aesthetic Productivity Extension

A clean, minimal, and aesthetic Pomodoro timer Chrome extension built using **HTML, CSS, and JavaScript**.  
Designed for focus, calm productivity, and real-world reliability, inspired by modern product-based applications.


##  What is the Pomodoro Technique?

The **Pomodoro Technique** is a time-management method that improves focus and productivity by breaking work into structured time blocks.

### Basic cycle:
-  **25 minutes** focused work  
-  **5 minutes** short break  
-  Repeat  
-  After 4 sessions → longer break  

### Benefits:
- Reduces mental fatigue  
- Improves concentration  
- Encourages healthy breaks  
- Prevents burnout  


##  Problem Statement

Most productivity timer extensions:
- Stop working when the popup closes  
- Lose state on refresh or tab switch  
- Rely on inaccurate JavaScript intervals  
- Have cluttered or distracting UI  
- Lack proper sound control  

### This project solves those problems by:
- Using a **background service worker** for reliability  
- Running timers even when the popup closes  
- Implementing a **calm, Pinterest-inspired aesthetic UI**  
- Supporting **dark & light modes**  
- Adding **soft, non-intrusive sound alerts**  
- Giving users full control (mute, volume, duration)  


##  Features

-  Reliable Pomodoro timer  
-  Background timer using **Chrome Alarms API**  
-  Gentle sound alerts for work & breaks  
-  Mute & volume control  
-  Dark & Light mode with persistence  
-  Minimal, aesthetic UI  
-  Settings persist across sessions  
-  Optimized & lightweight  
-  Focus Mode (persistent window for long sessions)


##  Architecture Overview

This extension follows a **clean, professional architecture** used in real-world products.

### 1️. Popup (UI Layer)
- Built using **HTML + CSS**
- Displays timer, controls, and settings
- Does **not** manage timer logic
- Requests state from background

### 2️. Background Service Worker
- Built using **JavaScript**
- Owns all timer logic
- Uses `chrome.alarms` for accuracy
- Runs even when popup is closed
- Sends completion events to UI

### 3️. Sound System
- Plays sound only on session completion
- Respects mute & volume preferences
- Chrome autoplay-safe implementation

This separation ensures **reliability, performance, and scalability**.



##  Tech Stack

- **HTML** — semantic UI structure  
- **CSS** — modern styling with CSS variables  
- **JavaScript (ES6+)** — logic & state management  
- **Chrome Extension APIs**
  - `chrome.alarms`
  - `chrome.runtime`
  - `chrome.storage`
  - `chrome.notifications`


##  Installation (Local Development)



1. Clone this repository:
   ```bash
   git clone https://github.com/Kirtii14/pomodoro-extension-kirti.git


2. Open Google Chrome and navigate to:

    chrome://extensions


3. Enable Developer Mode (top-right corner)

4. Click Load unpacked

5. Select the src/ folder from this project

**The extension will appear in your toolbar.**



## Screenshots:


## Demo Video:

 (see instructions below).


## Contact

For issues, feedback, or collaboration:

 Email: kirtit1444@gmail.com

 X (Twitter): https://x.com/cosmicc1444


## License

This project is licensed under the MIT License.



