# ⚡ Flow Math Practice by Razen Sensei

![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![PWA](https://img.shields.io/badge/PWA-Ready-success?style=for-the-badge)

**Flow Math** is a lightning-fast, frictionless web application designed to help users achieve a "flow state" while practicing arithmetic. 

By eliminating the need to click a "Submit" button and relying on instant keystroke validation, the app removes UI friction and allows the brain to process equations as fast as possible. 

[👉 Play the Live Demo Here](https://[Your-Username].github.io/flow-math/) *(Replace with your actual GitHub Pages link)*

---

## ✨ Core Features

* **Frictionless Validation:** The app listens to every keystroke. The millisecond you type the exact correct answer, it logs your speed, increments your streak, and instantly loads the next problem.
* **Forgiving Error Mechanics:** If you catch a typo, you can backspace without penalty. You are only penalized if you explicitly press the `Enter` key with the wrong answer.
* **Speed & Accuracy Analytics:** Tracks your Average Time per Question (in seconds) and Session Accuracy.
* **Session History:** Saves your past games in a detailed data table so you can track your improvement over time.
* **Multi-User Profiles:** Supports multiple users on the same device via Local Storage.
* **Progressive Web App (PWA):** Fully installable on iOS and Android. Works 100% offline.
* **Smart Subtraction:** Automatically swaps numbers during subtraction to ensure the answer is always a positive integer, maintaining the flow state.

---

## 🚀 How to Play

1. **Select Profile:** Enter your name to create a local profile or select an existing one.
2. **Game Setup:** Choose your operation (Addition, Subtraction, or Multiplication) and set the Min/Max range for the numbers.
3. **Start Session:** Type the correct answer using your keyboard or mobile number pad. 
4. **Pause/Stop:** Click Pause to freeze your speed timer if you need a break, or click Stop to end the session and save your stats to your History dashboard.

---

## 📱 Mobile Installation (PWA)

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
* **Logic:** Vanilla JavaScript (`script.js`).
* **Storage:** Browser `localStorage` (Profiles and History).
* **Offline Support:** Service Worker (`sw.js`) and Web App Manifest (`manifest.json`).

### File Structure
```text
/flow-math
├── index.html       # The main application UI and views
├── styles.css       # Clean, distraction-free styling and animations
├── script.js        # Game engine, validation, and state management
├── manifest.json    # PWA configuration (icons, theme colors, display mode)
└── sw.js            # Service worker for offline caching