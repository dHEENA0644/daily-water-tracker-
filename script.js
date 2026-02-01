const STEP = 250;
const MAX_PROGRESS_OFFSET = 440; // Dasharray value from CSS

// Store objects
let state = {
    goal: 2000,
    drank: 0,
    logs: [],
    theme: 'blue'
};

// DOM Elements
const elements = {
    goalInput: document.getElementById("goalInput"),
    setGoalBtn: document.getElementById("setGoal"),
    drankDisplay: document.getElementById("drank"),
    remainingDisplay: document.getElementById("remaining"),
    progressRing: document.getElementById("progressRing"),
    percentageText: document.getElementById("percentageText"),
    addWaterBtn: document.getElementById("addWater"),
    reasonSelect: document.getElementById("reason"),
    resetBtn: document.getElementById("reset"),
    historyList: document.getElementById("history"),
    root: document.documentElement
};

// Initialize
function init() {
    loadState();
    updateUI();
    setupEventListeners();
    setTheme(state.theme);
}

// Load from LocalStorage
function loadState() {
    const saved = localStorage.getItem("hydroflow_state");
    if (saved) {
        state = JSON.parse(saved);
        // Ensure theme exists in saved state to avoid null bugs
        if (!state.theme) state.theme = 'blue';
    }
}

// Save to LocalStorage
function saveState() {
    localStorage.setItem("hydroflow_state", JSON.stringify(state));
}

// Theme Handlers
function setTheme(themeName) {
    state.theme = themeName;
    elements.root.setAttribute('data-theme', themeName);
    saveState();
}

// Event Listeners
function setupEventListeners() {
    elements.setGoalBtn.addEventListener("click", handleSetGoal);
    elements.addWaterBtn.addEventListener("click", handleAddWater);
    elements.resetBtn.addEventListener("click", handleReset);
    
    // Allow defining function on window for HTML onclick handlers (theme buttons)
    window.setTheme = setTheme; 
}

// Handlers
function handleSetGoal() {
    const val = parseInt(elements.goalInput.value);
    if (val && val > 0) {
        state.goal = val;
        // Optionally reset progress on new goal? Keeping it separate for now.
        saveState();
        updateUI();
        elements.goalInput.value = "";
        triggerConfetti(0.5); // Small celebration for setting a goal
    } else {
        alert("Please enter a valid amount (ml).");
    }
}

function handleAddWater() {
    const reason = elements.reasonSelect.value;
    
    if (!reason) {
        alert("Please select a reason for drinking! 💧");
        elements.reasonSelect.focus();
        return;
    }

    // Add Water
    state.drank += STEP;
    
    // Add Log
    const log = {
        id: Date.now(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        amount: STEP,
        reason: reason
    };
    state.logs.unshift(log); // Add to beginning

    saveState();
    updateUI();
    
    // Reset selection/feedback
    elements.reasonSelect.value = "";
    
    if (state.drank >= state.goal) {
        triggerConfetti(1.5);
    }
}

function handleReset() {
    if (confirm("Are you sure you want to reset today's progress?")) {
        state.drank = 0;
        state.logs = [];
        saveState();
        updateUI();
    }
}

// UI Updates
function updateUI() {
    // Numbers
    elements.drankDisplay.textContent = state.drank;
    const remaining = Math.max(state.goal - state.drank, 0);
    elements.remainingDisplay.textContent = remaining;

    // Progress Ring
    const percentage = Math.min((state.drank / state.goal) * 100, 100);
    const offset = MAX_PROGRESS_OFFSET - (MAX_PROGRESS_OFFSET * percentage) / 100;
    elements.progressRing.style.strokeDashoffset = offset;
    elements.percentageText.textContent = `${Math.round(percentage)}%`;

    // History
    renderHistory();
}

function renderHistory() {
    elements.historyList.innerHTML = "";
    state.logs.forEach(log => {
        const li = document.createElement("li");
        li.innerHTML = `
            <div>
                <strong>${log.reason}</strong>
                <span class="history-time">${log.time}</span>
            </div>
            <span>+${log.amount}ml</span>
        `;
        elements.historyList.appendChild(li);
    });
}

// Simple Confetti Effect (Optional Polish)
function triggerConfetti(durationS) {
    // Just a placeholder. In a real app we might import a library.
    // Changing the button color briefly as visual feedback
    const originalText = elements.addWaterBtn.innerHTML;
    elements.addWaterBtn.innerHTML = '<i class="fa-solid fa-check"></i> Great Job!';
    setTimeout(() => {
        elements.addWaterBtn.innerHTML = originalText;
    }, 1500);
}

// Start App
init();
