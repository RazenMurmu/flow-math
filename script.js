if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(console.error));
}

let userProfile = {
    username: null,
    min1: 1, max1: 10,
    min2: 1, max2: 10,
    operation: '×',
    inputMode: 'manual', // NEW: Tracks typing vs choice
    history: []
};

let sessionState = {
    isActive: false, isPaused: false, num1: 0, num2: 0, streak: 0, attempts: 0, correct: 0, questionStartTime: 0, totalResponseTimeMs: 0
};

const els = {
    screenStart: document.getElementById('start-screen'),
    screenGame: document.getElementById('game-screen'),
    screenHistory: document.getElementById('history-screen'),
    modalProfile: document.getElementById('profile-modal'),
    modalPause: document.getElementById('pause-overlay'),
    
    inputUser: document.getElementById('username-input'),
    inputMin1: document.getElementById('min1'), inputMax1: document.getElementById('max1'),
    inputMin2: document.getElementById('min2'), inputMax2: document.getElementById('max2'),
    selectOp: document.getElementById('operation-select'),
    selectMode: document.getElementById('input-mode-select'), // NEW
    
    num1: document.getElementById('num1'), num2: document.getElementById('num2'),
    opDisplay: document.getElementById('operator-display'),
    
    containerManual: document.getElementById('input-container-manual'),
    containerChoice: document.getElementById('input-container-choice'),
    inputAnswer: document.getElementById('answer-input'),
    btnChoices: [document.getElementById('choice-0'), document.getElementById('choice-1'), document.getElementById('choice-2')],
    
    feedback: document.getElementById('feedback-message'),
    quizContainer: document.getElementById('quiz-container'),
    dispStreak: document.getElementById('current-streak'),
    dispSpeed: document.getElementById('avg-speed'),
    dispScore: document.getElementById('current-score'), // NEW
    historyBody: document.getElementById('history-body')
};

// --- DATA MANAGEMENT ---
function saveProfile() {
    if (!userProfile.username) return;
    userProfile.min1 = parseInt(els.inputMin1.value) || 1;
    userProfile.max1 = parseInt(els.inputMax1.value) || 10;
    userProfile.min2 = parseInt(els.inputMin2.value) || 1;
    userProfile.max2 = parseInt(els.inputMax2.value) || 10;
    userProfile.operation = els.selectOp.value;
    userProfile.inputMode = els.selectMode.value; // Save mode
    
    localStorage.setItem(`flowMath_user_${userProfile.username}`, JSON.stringify(userProfile));
}

function loadProfile(username) {
    const saved = localStorage.getItem(`flowMath_user_${username}`);
    if (saved) {
        userProfile = JSON.parse(saved);
        if(!userProfile.history) userProfile.history = [];
        if(!userProfile.inputMode) userProfile.inputMode = 'manual'; // Fallback
    } else {
        userProfile = { username, min1: 1, max1: 10, min2: 1, max2: 10, operation: '×', inputMode: 'manual', history: [] };
    }
    
    document.getElementById('display-name').textContent = username;
    els.inputMin1.value = userProfile.min1; els.inputMax1.value = userProfile.max1;
    els.inputMin2.value = userProfile.min2; els.inputMax2.value = userProfile.max2;
    els.selectOp.value = userProfile.operation;
    els.selectMode.value = userProfile.inputMode;
    
    els.modalProfile.classList.add('hidden');
}

function checkLogin() {
    const lastUser = localStorage.getItem('flowMath_lastUser');
    if (lastUser) loadProfile(lastUser);
    else { els.modalProfile.classList.remove('hidden'); els.inputUser.focus(); }
}

function switchView(viewElement) {
    [els.screenStart, els.screenGame, els.screenHistory].forEach(el => {
        el.classList.remove('view-active'); el.classList.add('view-hidden');
    });
    viewElement.classList.remove('view-hidden'); viewElement.classList.add('view-active');
}

// --- CORE MATH & LOGIC ---
function getCorrectAnswer() {
    if (userProfile.operation === '+') return sessionState.num1 + sessionState.num2;
    if (userProfile.operation === '-') return sessionState.num1 - sessionState.num2;
    if (userProfile.operation === '×') return sessionState.num1 * sessionState.num2;
}

// SMART WRONG ANSWER GENERATOR
function generateOptions(correctAnswer) {
    let options = new Set();
    options.add(correctAnswer);

    while(options.size < 3) {
        // Create believable wrong answers (distractors)
        let offset = Math.floor(Math.random() * 5) + 1; // off by 1 to 5
        let sign = Math.random() > 0.5 ? 1 : -1;
        let wrong = correctAnswer + (offset * sign);
        
        // Ensure no negative multiple choice answers unless actual answer is negative
        if (wrong >= 0 || correctAnswer < 0) {
            options.add(wrong);
        }
    }
    
    // Convert Set to Array and Shuffle so correct answer is random
    return Array.from(options).sort(() => Math.random() - 0.5);
}

function generateProblem() {
    sessionState.num1 = Math.floor(Math.random() * (userProfile.max1 - userProfile.min1 + 1)) + userProfile.min1;
    sessionState.num2 = Math.floor(Math.random() * (userProfile.max2 - userProfile.min2 + 1)) + userProfile.min2;
    
    if (userProfile.operation === '-' && sessionState.num1 < sessionState.num2) {
        let temp = sessionState.num1; sessionState.num1 = sessionState.num2; sessionState.num2 = temp;
    }

    els.num1.textContent = sessionState.num1;
    els.num2.textContent = sessionState.num2;
    els.opDisplay.textContent = userProfile.operation;
    
    // UI Layout based on Mode
    if (userProfile.inputMode === 'choice') {
        els.containerManual.classList.add('hidden');
        els.containerChoice.classList.remove('hidden');
        
        const answers = generateOptions(getCorrectAnswer());
        els.btnChoices.forEach((btn, index) => {
            btn.textContent = answers[index];
            btn.classList.remove('wrong-choice'); // Reset any red buttons
        });
    } else {
        els.containerChoice.classList.add('hidden');
        els.containerManual.classList.remove('hidden');
        els.inputAnswer.value = '';
        els.inputAnswer.focus();
    }
    
    sessionState.questionStartTime = Date.now();
}

function updateGameStats() {
    els.dispStreak.textContent = sessionState.streak;
    els.dispScore.textContent = sessionState.correct; // Show total points
    
    if (sessionState.correct > 0 && sessionState.totalResponseTimeMs > 0) {
        const avgMs = sessionState.totalResponseTimeMs / sessionState.correct;
        els.dispSpeed.textContent = (avgMs / 1000).toFixed(1);
    } else {
        els.dispSpeed.textContent = '0.0';
    }
}

function triggerSuccess() {
    const timeTaken = Date.now() - sessionState.questionStartTime;
    sessionState.totalResponseTimeMs += timeTaken;
    sessionState.streak++;
    sessionState.correct++;
    sessionState.attempts++;
    
    updateGameStats();
    els.quizContainer.classList.add('flash-success');
    els.feedback.classList.add('hidden');
    setTimeout(() => els.quizContainer.classList.remove('flash-success'), 150);
    generateProblem();
}

function triggerPenalty(buttonElement = null) {
    sessionState.streak = 0;
    sessionState.attempts++;
    
    // DEDUCT A POINT (Minimum 0)
    if (sessionState.correct > 0) sessionState.correct--;
    
    updateGameStats();
    
    els.feedback.textContent = "Wrong! -1 Point";
    els.feedback.classList.remove('hidden');
    setTimeout(() => els.feedback.classList.add('hidden'), 1500);

    if (buttonElement) {
        buttonElement.classList.add('wrong-choice');
    } else {
        els.inputAnswer.value = ''; // clear manual input
    }
}

function startSession() {
    saveProfile();
    sessionState = { isActive: true, isPaused: false, num1: 0, num2: 0, streak: 0, attempts: 0, correct: 0, questionStartTime: 0, totalResponseTimeMs: 0 };
    updateGameStats();
    switchView(els.screenGame);
    generateProblem();
}

function stopSession() {
    if (sessionState.attempts > 0) {
        const avgSecs = sessionState.correct > 0 ? (sessionState.totalResponseTimeMs / sessionState.correct / 1000).toFixed(1) : 0;
        const accuracy = Math.round((sessionState.correct / sessionState.attempts) * 100);
        userProfile.history.unshift({
            date: new Date().toLocaleDateString(),
            type: userProfile.operation,
            score: `${sessionState.correct}/${sessionState.attempts}`,
            accuracy: accuracy,
            speed: avgSecs
        });
        saveProfile();
    }
    sessionState.isActive = false;
    switchView(els.screenStart);
}

// --- EVENT LISTENERS ---

// Login
document.getElementById('create-profile-btn').addEventListener('click', () => {
    const name = els.inputUser.value.trim();
    if (name) { localStorage.setItem('flowMath_lastUser', name); loadProfile(name); }
});
document.getElementById('btn-switch-user').addEventListener('click', () => {
    localStorage.removeItem('flowMath_lastUser'); els.inputUser.value = '';
    els.modalProfile.classList.remove('hidden'); els.inputUser.focus();
});

// Menu Controls
document.getElementById('btn-start-game').addEventListener('click', startSession);
document.getElementById('btn-view-history').addEventListener('click', () => {
    els.historyBody.innerHTML = '';
    userProfile.history.forEach(session => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${session.date}</td><td>${session.type}</td><td>${session.score}</td><td>${session.accuracy}%</td><td>${session.speed}s</td>`;
        els.historyBody.appendChild(tr);
    });
    switchView(els.screenHistory);
});
document.getElementById('btn-close-history').addEventListener('click', () => switchView(els.screenStart));

// In-Game Controls
document.getElementById('btn-pause').addEventListener('click', () => {
    sessionState.isPaused = true; els.modalPause.classList.remove('hidden');
    sessionState.pauseElapsedTime = Date.now() - sessionState.questionStartTime; 
});
document.getElementById('btn-resume').addEventListener('click', () => {
    sessionState.isPaused = false; els.modalPause.classList.add('hidden');
    sessionState.questionStartTime = Date.now() - sessionState.pauseElapsedTime;
    if(userProfile.inputMode === 'manual') els.inputAnswer.focus();
});
document.getElementById('btn-stop').addEventListener('click', stopSession);

// 1. MANUAL MODE LOGIC (Typing)
els.inputAnswer.addEventListener('input', (e) => {
    if (sessionState.isPaused || userProfile.inputMode !== 'manual') return;
    if (parseInt(e.target.value, 10) === getCorrectAnswer()) triggerSuccess();
});

els.inputAnswer.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !sessionState.isPaused && userProfile.inputMode === 'manual') {
        if (parseInt(e.target.value, 10) !== getCorrectAnswer() && e.target.value !== '') triggerPenalty();
    }
});

els.quizContainer.addEventListener('click', () => {
    if (!sessionState.isPaused && userProfile.inputMode === 'manual') els.inputAnswer.focus();
});

// 2. MULTIPLE CHOICE MODE LOGIC (Clicking)
els.btnChoices.forEach(btn => {
    btn.addEventListener('click', (e) => {
        if (sessionState.isPaused || userProfile.inputMode !== 'choice') return;
        
        // Prevent clicking a button that is already marked wrong
        if (btn.classList.contains('wrong-choice')) return;

        const selectedAnswer = parseInt(e.target.textContent, 10);
        
        if (selectedAnswer === getCorrectAnswer()) {
            triggerSuccess();
        } else {
            triggerPenalty(btn); // Pass the button to turn it red
        }
    });
});

checkLogin();