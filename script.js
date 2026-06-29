// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(console.error));
}

// Global State
let userProfile = {
    username: null,
    min1: 1, max1: 10,
    min2: 1, max2: 10,
    operation: '×',
    history: []
};

let sessionState = {
    isActive: false,
    isPaused: false,
    num1: 0, num2: 0,
    streak: 0,
    attempts: 0,
    correct: 0,
    questionStartTime: 0,
    totalResponseTimeMs: 0 // Track total ms spent answering correctly
};

// DOM Elements
const els = {
    // Views
    screenStart: document.getElementById('start-screen'),
    screenGame: document.getElementById('game-screen'),
    screenHistory: document.getElementById('history-screen'),
    
    // Modals
    modalProfile: document.getElementById('profile-modal'),
    modalPause: document.getElementById('pause-overlay'),
    
    // Inputs & Settings
    inputUser: document.getElementById('username-input'),
    inputMin1: document.getElementById('min1'),
    inputMax1: document.getElementById('max1'),
    inputMin2: document.getElementById('min2'),
    inputMax2: document.getElementById('max2'),
    selectOp: document.getElementById('operation-select'),
    
    // Game UI
    num1: document.getElementById('num1'),
    num2: document.getElementById('num2'),
    opDisplay: document.getElementById('operator-display'),
    inputAnswer: document.getElementById('answer-input'),
    feedback: document.getElementById('feedback-message'),
    quizContainer: document.getElementById('quiz-container'),
    dispStreak: document.getElementById('current-streak'),
    dispSpeed: document.getElementById('avg-speed'),
    
    // History UI
    historyBody: document.getElementById('history-body')
};

// --- DATA MANAGEMENT ---

function saveProfile() {
    if (!userProfile.username) return;
    // Update settings before saving
    userProfile.min1 = parseInt(els.inputMin1.value) || 1;
    userProfile.max1 = parseInt(els.inputMax1.value) || 10;
    userProfile.min2 = parseInt(els.inputMin2.value) || 1;
    userProfile.max2 = parseInt(els.inputMax2.value) || 10;
    userProfile.operation = els.selectOp.value;
    
    localStorage.setItem(`flowMath_user_${userProfile.username}`, JSON.stringify(userProfile));
}

function loadProfile(username) {
    const saved = localStorage.getItem(`flowMath_user_${username}`);
    if (saved) {
        userProfile = JSON.parse(saved);
        if(!userProfile.history) userProfile.history = []; // Fallback for old saves
    } else {
        // Brand new profile
        userProfile = { username, min1: 1, max1: 10, min2: 1, max2: 10, operation: '×', history: [] };
    }
    
    // Populate UI
    document.getElementById('display-name').textContent = username;
    els.inputMin1.value = userProfile.min1; els.inputMax1.value = userProfile.max1;
    els.inputMin2.value = userProfile.min2; els.inputMax2.value = userProfile.max2;
    els.selectOp.value = userProfile.operation;
    
    els.modalProfile.classList.add('hidden');
}

function checkLogin() {
    const lastUser = localStorage.getItem('flowMath_lastUser');
    if (lastUser) {
        loadProfile(lastUser);
    } else {
        els.modalProfile.classList.remove('hidden');
        els.inputUser.focus();
    }
}

// --- VIEW ROUTING ---

function switchView(viewElement) {
    [els.screenStart, els.screenGame, els.screenHistory].forEach(el => {
        el.classList.remove('view-active');
        el.classList.add('view-hidden');
    });
    viewElement.classList.remove('view-hidden');
    viewElement.classList.add('view-active');
}

// --- GAME LOGIC ---

function getCorrectAnswer() {
    const n1 = sessionState.num1;
    const n2 = sessionState.num2;
    if (userProfile.operation === '+') return n1 + n2;
    if (userProfile.operation === '-') return n1 - n2;
    if (userProfile.operation === '×') return n1 * n2;
}

function generateProblem() {
    sessionState.num1 = Math.floor(Math.random() * (userProfile.max1 - userProfile.min1 + 1)) + userProfile.min1;
    sessionState.num2 = Math.floor(Math.random() * (userProfile.max2 - userProfile.min2 + 1)) + userProfile.min2;
    
    // Smart Subtraction: Swap if num1 is smaller so answer is always positive
    if (userProfile.operation === '-' && sessionState.num1 < sessionState.num2) {
        let temp = sessionState.num1;
        sessionState.num1 = sessionState.num2;
        sessionState.num2 = temp;
    }

    els.num1.textContent = sessionState.num1;
    els.num2.textContent = sessionState.num2;
    els.opDisplay.textContent = userProfile.operation;
    
    els.inputAnswer.value = '';
    els.inputAnswer.focus();
    sessionState.questionStartTime = Date.now(); // Start speed timer
}

function updateGameStats() {
    els.dispStreak.textContent = sessionState.streak;
    
    if (sessionState.correct > 0) {
        const avgMs = sessionState.totalResponseTimeMs / sessionState.correct;
        els.dispSpeed.textContent = (avgMs / 1000).toFixed(1);
    } else {
        els.dispSpeed.textContent = '0.0';
    }
}

function startSession() {
    saveProfile(); // Save the selected ranges/operation
    sessionState = { isActive: true, isPaused: false, num1: 0, num2: 0, streak: 0, attempts: 0, correct: 0, questionStartTime: 0, totalResponseTimeMs: 0 };
    updateGameStats();
    switchView(els.screenGame);
    generateProblem();
}

function stopSession() {
    if (sessionState.attempts > 0) {
        // Save Session to History
        const avgSecs = sessionState.correct > 0 ? (sessionState.totalResponseTimeMs / sessionState.correct / 1000).toFixed(1) : 0;
        const accuracy = Math.round((sessionState.correct / sessionState.attempts) * 100);
        
        const sessionRecord = {
            date: new Date().toLocaleDateString(),
            type: userProfile.operation,
            score: `${sessionState.correct}/${sessionState.attempts}`,
            accuracy: accuracy,
            speed: avgSecs
        };
        
        userProfile.history.unshift(sessionRecord); // Add to top of list
        saveProfile();
    }
    
    sessionState.isActive = false;
    switchView(els.screenStart);
}

// --- EVENT LISTENERS ---

// Login / User Management
document.getElementById('create-profile-btn').addEventListener('click', () => {
    const name = els.inputUser.value.trim();
    if (name) {
        localStorage.setItem('flowMath_lastUser', name);
        loadProfile(name);
    }
});
document.getElementById('btn-switch-user').addEventListener('click', () => {
    localStorage.removeItem('flowMath_lastUser');
    els.inputUser.value = '';
    els.modalProfile.classList.remove('hidden');
    els.inputUser.focus();
});

// Menu Actions
document.getElementById('btn-start-game').addEventListener('click', startSession);
document.getElementById('btn-view-history').addEventListener('click', () => {
    // Populate table
    els.historyBody.innerHTML = '';
    userProfile.history.forEach(session => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${session.date}</td>
            <td>${session.type}</td>
            <td>${session.score}</td>
            <td>${session.accuracy}%</td>
            <td>${session.speed}s</td>
        `;
        els.historyBody.appendChild(tr);
    });
    switchView(els.screenHistory);
});
document.getElementById('btn-close-history').addEventListener('click', () => switchView(els.screenStart));

// In-Game Controls
document.getElementById('btn-pause').addEventListener('click', () => {
    sessionState.isPaused = true;
    els.modalPause.classList.remove('hidden');
    // We don't want the time paused to ruin their average speed, so we capture elapsed time
    sessionState.pauseElapsedTime = Date.now() - sessionState.questionStartTime; 
});
document.getElementById('btn-resume').addEventListener('click', () => {
    sessionState.isPaused = false;
    els.modalPause.classList.add('hidden');
    // Adjust start time so the pause duration is ignored
    sessionState.questionStartTime = Date.now() - sessionState.pauseElapsedTime;
    els.inputAnswer.focus();
});
document.getElementById('btn-stop').addEventListener('click', stopSession);

// Gameplay Validation (Instant)
els.inputAnswer.addEventListener('input', (e) => {
    if (sessionState.isPaused) return;
    const userAnswer = parseInt(e.target.value, 10);
    
    if (userAnswer === getCorrectAnswer()) {
        const timeTaken = Date.now() - sessionState.questionStartTime;
        sessionState.totalResponseTimeMs += timeTaken;
        
        sessionState.streak++;
        sessionState.correct++;
        sessionState.attempts++;
        
        updateGameStats();
        
        // Success flash
        els.quizContainer.classList.add('flash-success');
        els.feedback.classList.add('hidden');
        setTimeout(() => els.quizContainer.classList.remove('flash-success'), 150);
        
        generateProblem();
    }
});

// Error handling on Enter
els.inputAnswer.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !sessionState.isPaused) {
        const userAnswer = parseInt(e.target.value, 10);
        if (userAnswer !== getCorrectAnswer() && e.target.value !== '') {
            sessionState.streak = 0;
            sessionState.attempts++;
            updateGameStats();
            
            els.feedback.classList.remove('hidden');
            els.inputAnswer.value = ''; // clear for retry
            // Don't reset the timer on an error, let it keep ticking to penalize their speed naturally
            setTimeout(() => els.feedback.classList.add('hidden'), 2000);
        }
    }
});

// Force focus on background click
els.quizContainer.addEventListener('click', () => {
    if (!sessionState.isPaused) els.inputAnswer.focus();
});

// Init
checkLogin();
