# 🍅 Pomodoro Focus - Aesthetic Productivity Extension

A clean, minimal, and aesthetic Pomodoro timer extension built using **HTML, CSS, and JavaScript**.  
Designed for focus, calm productivity, and real-world reliability, inspired by modern product-based applications.

---

##  What is the Pomodoro Technique?

The **Pomodoro Technique** is a time-management method that helps improve focus and productivity by breaking work into short, structured sessions.

### Basic cycle:
-  **25 minutes** focused work  
-  **5 minutes** short break  
-  Repeat  
-  After 4 sessions → longer break  

This approach:
- Reduces mental fatigue  
- Improves concentration  
- Encourages consistent breaks  
- Prevents burnout  

---

##  Problem Statement

Most productivity timers:
- Stop working when the UI closes  
- Lose state on refresh  
- Use unreliable JavaScript intervals  
- Have cluttered or distracting UI  
- Lack sound control and accessibility  

### This project solves that by:
- Using a **background service worker** for reliability  
- Running timers even when popup closes  
- Providing a **calm, Pinterest-aesthetic UI**  
- Supporting **dark/light mode**  
- Adding **soft, non-annoying sound alerts**  
- Giving full user control (mute, volume, duration)  

---

## Features

-  Reliable Pomodoro timer  
-  Background timer using Chrome Alarms API  
-  Gentle sound alerts (work / break)  
-  Mute & volume control  
-  Dark & Light mode with persistence  
-  Minimal, aesthetic UI  
-  Settings persist across sessions  
-  Optimized & lightweight  

---

## Architecture Overview

This extension follows a **clean, professional architecture**:

### 1️. Popup (UI Layer)
- Built with **HTML + CSS**
- Displays timer, buttons, settings
- Does **not** run the timer
- Requests state from background

### 2️. Background Service Worker
- Built with **JavaScript**
- Manages timer logic
- Uses `chrome.alarms` for accuracy
- Runs even when popup closes
- Sends events to popup

### 3. Sound System
- Plays sound only on session completion
- Respects mute & volume settings
- Chrome autoplay-safe handling

This separation ensures **reliability, performance, and scalability**.

---

## Tech Stack

- **HTML** — semantic UI structure  
- **CSS** — modern styling with CSS variables  
- **JavaScript (ES6+)** — logic & state management  
- **Chrome Extension APIs**
  - `chrome.alarms`
  - `chrome.runtime`
  - `chrome.storage`
  - `chrome.notifications`

---

## Installation (Local Development)

1. Clone this repository:
   ```bash
   git clone https://github.com/Kirtii14/pomodoro-extension-kirti.git

