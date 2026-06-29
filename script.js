// Register Service Worker for PWA / Offline capability
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(err => {
            console.log('Service Worker registration failed: ', err);
        });
    });
}

// State Management (Now tracks user)
let state = {
    username: null,
    num1: 0, num2: 0,
    min1: 1, max1: 10,
    min2: 1, max2: 10,
    streak: 0,
    bestStreak: 0,
    attempts: 0,
    correct: 0
};

// DOM Elements
const els = {
    num1: document.getElementById('num1'),
    num2: document.getElementById('num2'),
    input: document.getElementById('answer-input'),
    feedback: document.getElementById('feedback-message'),
    quizContainer: document.getElementById('quiz-container'),
    streak: document.getElementById('current-streak'),
    dashboard: document.getElementById('dashboard'),
    btnToggle: document.getElementById('toggle-dashboard'),
    btnApply: document.getElementById('apply-settings'),
    statCorrect: document.getElementById('stat-correct'),
    statAccuracy: document.getElementById('stat-accuracy'),
    statBest: document.getElementById('stat-best-streak'),
    
    // Profile Elements
    modal: document.getElementById('profile-modal'),
    usernameInput: document.getElementById('username-input'),
    btnCreateProfile: document.getElementById('create-profile-btn'),
    displayName: document.getElementById('display-name'),
    btnSwitchUser: document.getElementById('switch-user-btn'),
    
    // Settings inputs
    min1: document.getElementById('min1'), max1: document.getElementById('max1'),
    min2: document.getElementById('min2'), max2: document.getElementById('max2')
};

// --- Profile & Local Storage Logic ---

function saveProgress() {
    if (!state.username) return;
    const saveObj = {
        bestStreak: state.bestStreak,
        attempts: state.attempts,
        correct: state.correct,
        min1: state.min1, max1: state.max1,
        min2: state.min2, max2: state.max2
    };
    localStorage.setItem(`flowMath_${state.username}`, JSON.stringify(saveObj));
}

function loadProfile(username) {
    state.username = username;
    els.displayName.textContent = username;
    els.modal.classList.add('hidden');
    
    const savedData = localStorage.getItem(`flowMath_${username}`);
    if (savedData) {
        const parsed = JSON.parse(savedData);
        state.bestStreak = parsed.bestStreak || 0;
        state.attempts = parsed.attempts || 0;
        state.correct = parsed.correct || 0;
        state.min1 = parsed.min1 || 1; state.max1 = parsed.max1 || 10;
        state.min2 = parsed.min2 || 1; state.max2 = parsed.max2 || 10;
    } else {
        // New user resets
        state.bestStreak = 0; state.attempts = 0; state.correct = 0;
        state.min1 = 1; state.max1 = 10; state.min2 = 1; state.max2 = 10;
    }
    
    // Sync settings UI
    els.min1.value = state.min1; els.max1.value = state.max1;
    els.min2.value = state.min2; els.max2.value = state.max2;
    
    state.streak = 0;
    updateStats();
    generateProblem();
}

function checkExistingProfile() {
    // Keep last logged in user, or prompt
    const lastUser = localStorage.getItem('flowMath_lastUser');
    if (lastUser) {
        loadProfile(lastUser);
    } else {
        els.modal.classList.remove('hidden');
        els.usernameInput.focus();
    }
}

// --- Core Math Logic ---

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateProblem() {
    state.num1 = getRandomInt(state.min1, state.max1);
    state.num2 = getRandomInt(state.min2, state.max2);
    els.num1.textContent = state.num1;
    els.num2.textContent = state.num2;
    els.input.value = '';
    els.input.focus();
}

function updateStats() {
    els.streak.textContent = state.streak;
    els.statCorrect.textContent = state.correct;
    els.statBest.textContent = state.bestStreak;
    
    const accuracy = state.attempts === 0 ? 0 : Math.round((state.correct / state.attempts) * 100);
    els.statAccuracy.textContent = `${accuracy}%`;
}

function triggerSuccessFlash() {
    els.quizContainer.classList.add('flash-success');
    els.feedback.classList.add('hidden');
    setTimeout(() => els.quizContainer.classList.remove('flash-success'), 150);
}

// --- Event Listeners ---

// Profile Creation
els.btnCreateProfile.addEventListener('click', () => {
    const name = els.usernameInput.value.trim();
    if (name) {
        localStorage.setItem('flowMath_lastUser', name);
        loadProfile(name);
    }
});

els.usernameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') els.btnCreateProfile.click();
});

// Switch User
els.btnSwitchUser.addEventListener('click', () => {
    localStorage.removeItem('flowMath_lastUser');
    els.dashboard.classList.add('hidden');
    els.usernameInput.value = '';
    els.modal.classList.remove('hidden');
    els.usernameInput.focus();
});

// Input Validation
els.input.addEventListener('input', (e) => {
    const userAnswer = parseInt(e.target.value, 10);
    const correctAnswer = state.num1 * state.num2;

    if (userAnswer === correctAnswer) {
        state.streak++;
        state.correct++;
        state.attempts++;
        if (state.streak > state.bestStreak) state.bestStreak = state.streak;
        
        updateStats();
        saveProgress();
        triggerSuccessFlash();
        generateProblem();
    }
});

// Error Handling
els.input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const userAnswer = parseInt(e.target.value, 10);
        const correctAnswer = state.num1 * state.num2;

        if (userAnswer !== correctAnswer && e.target.value !== '') {
            state.streak = 0;
            state.attempts++;
            
            els.feedback.classList.remove('hidden');
            els.input.value = '';
            
            updateStats();
            saveProgress();
            
            setTimeout(() => els.feedback.classList.add('hidden'), 2000);
        }
    }
});

// Dashboard Toggles
els.btnToggle.addEventListener('click', () => {
    els.dashboard.classList.toggle('hidden');
    if(els.dashboard.classList.contains('hidden')) els.input.focus();
});

els.btnApply.addEventListener('click', () => {
    state.min1 = parseInt(els.min1.value, 10) || 1;
    state.max1 = parseInt(els.max1.value, 10) || 10;
    state.min2 = parseInt(els.min2.value, 10) || 1;
    state.max2 = parseInt(els.max2.value, 10) || 10;

    state.streak = 0;
    updateStats();
    saveProgress();
    
    els.dashboard.classList.add('hidden');
    generateProblem();
});

els.quizContainer.addEventListener('click', () => {
    if(els.dashboard.classList.contains('hidden') && els.modal.classList.contains('hidden')) {
        els.input.focus();
    }
});

// Init
checkExistingProfile();