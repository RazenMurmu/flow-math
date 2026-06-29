# ⚡ Flow Math Practice v3 by RAZEN MURMU 

![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![PWA](https://img.shields.io/badge/PWA-Ready-success?style=for-the-badge)

**Flow Math** is a lightning-fast, progressive web application (PWA) designed to help users practice basic arithmetic. 

By eliminating UI friction like "Submit" buttons and utilizing instant validation, the app allows the brain to process equations as fast as possible. 

[👉 Play the Live Demo Here](https://[Your-Username].github.io/flow-math/) *(Note: Replace with your actual GitHub Pages link)*

---

## ✨ Core Features

* **Dual Input Modes:**
  * **Typing (Flow State):** Type the answer. The millisecond you type it correctly, the next problem loads.
  * **Multiple Choice:** Test your visual recognition. Click one of 3 options. Wrong answers turn red, shake, and deduct a point.
* **Smart Operations:** Practice Addition (+), Multiplication (×), or Subtraction (-). The subtraction engine automatically prevents negative answers to maintain flow.
* **Advanced Analytics:** Tracks your **Average Speed** (seconds per question), **Total Score**, and **Accuracy**.
* **Session History Dashboard:** Saves your past games in a local data table so you can track your improvement over time.
* **Pause Mechanics:** Need a break? Pause the game without ruining your speed average.
* **Multi-User Profiles:** Supports multiple players on the same device via Local Storage.
* **Progressive Web App (PWA):** Fully installable on iOS and Android. Works 100% offline.

---

## 🚀 How to Play

1. **Log In:** Enter your name to create a local profile or select your existing one.
2. **Game Setup:** Choose your operation (+, -, ×), select your Input Mode (Typing vs. Choice), and set the minimum/maximum number ranges.
3. **Start Session:** Answer as fast as you can. 
   * *In Typing mode:* Hitting `Enter` with the wrong answer resets your streak.
   * *In Choice mode:* Clicking the wrong button deducts 1 point from your total score.
4. **Stop & Save:** Click Stop to end the session. Your stats will automatically be saved to your History dashboard.

---

## 📱 Mobile Installation (Offline PWA)

This app is built to feel exactly like a native mobile app. You can install it directly to your phone without using an app store:

**For iOS (Safari):**
1. Navigate to the live URL.
2. Tap the **Share** button at the bottom of the screen.
3. Scroll down and tap **Add to Home Screen**.

**For Android (Chrome):**
1. Navigate to the live URL.
2. Tap the **3-dot menu** in the top right corner.
3. Tap **Install App** or **Add to Home screen**.

---

## 🛠️ Technical Architecture

Flow Math is intentionally lightweight. It requires **zero build tools, zero dependencies, and no backend database.**

* **Frontend:** Standard HTML5 and CSS3.
* **Game Engine:** Vanilla JavaScript (`script.js`).
* **Storage:** Browser `localStorage` (Profiles and Session History).
* **Offline Support:** Service Worker (`sw.js`) and Web App Manifest (`manifest.json`).

### File Structure
```text
/flow-math
├── index.html       # The main application UI, Modals, and Views
├── styles.css       # Clean, distraction-free styling and animations
├── script.js        # Game engine, multiple-choice logic, and state management
├── manifest.json    # PWA configuration (icons, theme colors, display mode)
└── sw.js            # Service worker for offline caching