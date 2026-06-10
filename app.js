// app.js
// Main client-side state coordinator and UI handler for the RPG Skill Tree Simulator

// --- GLOBAL STATE DEFAULTS ---
let state = {
  username: "NeoCoder",
  avatar: "🧙‍♂️",
  targetCareer: "software_developer",
  knowledgeLevel: "beginner",
  level: 1,
  xp: 0,
  streak: 1,
  lastActiveDate: new Date().toDateString(),
  unlockedNodes: [],
  completedVibeProjects: 0,
  completedMissions: [],
  exploredTools: [],
  joinedGroups: [],
  theme: "dark"
};

// Global variables for active node view slides
let currentLessonSlideIndex = 0;
let currentLessonSlides = [];
let currentDrawerNodeId = null;
let skillsChart = null;

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  loadProfile();
  initRouting();
  initOnboarding();
  initSettings();
  initGlossary();
  initToolsExplorer();
  initCareerAdvisor();
  initVibeCoding();
  initMentorChat();
  initCommunity();
  
  // Render dashboard values
  updateHUD();
  renderDashboard();
  // Pre-draw skill tree so first visit loads instantly
  initSkillTree();
});

// --- LOCAL STORAGE SYNC ---
function saveProfile() {
  localStorage.setItem("rpg_student_profile", JSON.stringify(state));
  updateHUD();
}

function loadProfile() {
  const saved = localStorage.getItem("rpg_student_profile");
  if (saved) {
    state = JSON.parse(saved);
    // Backward compatibility validations
    if (!state.completedMissions) state.completedMissions = [];
    if (!state.exploredTools) state.exploredTools = [];
    if (!state.joinedGroups) state.joinedGroups = [];
    if (!state.unlockedNodes) state.unlockedNodes = [];
    
    // Check if new day to reset streak and missions
    const today = new Date().toDateString();
    if (state.lastActiveDate !== today) {
      // If active yesterday, keep/increment streak; if longer, reset streak to 1
      const lastActive = new Date(state.lastActiveDate);
      const diffTime = Math.abs(new Date(today) - lastActive);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        state.streak += 1;
      } else if (diffDays > 1) {
        state.streak = 1;
      }
      
      state.lastActiveDate = today;
      state.completedMissions = []; // Reset daily missions
    }
  } else {
    // No saved profile — show onboarding modal
    document.getElementById("onboardingModal").classList.add("active");
  }
}

// --- THEME MANAGEMENT ---
function initTheme() {
  const toggleBtn = document.getElementById("themeToggleBtn");
  toggleBtn.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", nextTheme);
    state.theme = nextTheme;
    toggleBtn.innerText = nextTheme === "dark" ? "🌙" : "☀️";
    saveProfile();
  });
  
  // Apply saved theme
  document.documentElement.setAttribute("data-theme", state.theme || "dark");
  toggleBtn.innerText = state.theme === "dark" ? "🌙" : "☀️";
}

// --- HUD RENDERING & FORMULAS ---
function getXPNeededForLevel(level) {
  return Math.round(level * 1000 * 1.2);
}

function getRankTitle(level) {
  if (level >= 9) return "AI ARCHITECT";
  if (level >= 7) return "VIBE CODING MASTER";
  if (level >= 5) return "PROMPT WIZARD";
  if (level >= 3) return "AI EXPLORER";
  return "ROOKIE LEARNER";
}

function updateHUD() {
  document.getElementById("hudUsername").innerText = state.username;
  document.getElementById("hudAvatar").innerText = state.avatar;
  
  const xpNeeded = getXPNeededForLevel(state.level);
  document.getElementById("hudLevelVal").innerText = state.level;
  document.getElementById("hudCurrentXp").innerText = state.xp;
  document.getElementById("hudNextLevelXp").innerText = xpNeeded;
  
  const xpPercent = Math.min(100, Math.round((state.xp / xpNeeded) * 100));
  document.getElementById("hudXpFill").style.width = `${xpPercent}%`;
  
  const rank = getRankTitle(state.level);
  document.getElementById("hudRankLabel").innerText = rank.split(" ")[0]; // short version
  document.getElementById("hudTitle").innerText = rank;
  document.getElementById("hudStreakVal").innerText = state.streak;
}

// Grant XP safely, checking for level-up thresholds
function grantXP(amount) {
  state.xp += amount;
  let xpNeeded = getXPNeededForLevel(state.level);
  let leveledUp = false;
  
  while (state.xp >= xpNeeded) {
    state.xp -= xpNeeded;
    state.level += 1;
    xpNeeded = getXPNeededForLevel(state.level);
    leveledUp = true;
  }
  
  saveProfile();
  
  if (leveledUp) {
    triggerLevelUpModal();
  }
}

function triggerLevelUpModal() {
  document.getElementById("levelUpModalLevelVal").innerText = state.level;
  const rank = getRankTitle(state.level);
  document.getElementById("levelUpModalRankLabel").innerText = rank;
  document.getElementById("levelUpModal").classList.add("active");
  
  // Fire visual confetti!
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }
}

// --- ONBOARDING FORM HANDLER ---
function initOnboarding() {
  const onboardBtn = document.getElementById("onboardSubmitBtn");
  const usernameInput = document.getElementById("onboardUsername");
  const avatarSelect = document.getElementById("onboardAvatar");
  const careerSelect = document.getElementById("onboardCareer");
  
  // Quick style toggle for knowledge level radio labels
  const btnBeginner = document.getElementById("lblOnboardKnowledgeBeginner");
  const btnIntermediate = document.getElementById("lblOnboardKnowledgeIntermediate");
  
  btnBeginner.addEventListener("click", () => {
    btnBeginner.style.borderColor = "var(--color-primary)";
    btnBeginner.style.background = "rgba(0, 240, 255, 0.05)";
    btnIntermediate.style.borderColor = "rgba(255,255,255,0.06)";
    btnIntermediate.style.background = "none";
    state.knowledgeLevel = "beginner";
  });

  btnIntermediate.addEventListener("click", () => {
    btnIntermediate.style.borderColor = "var(--color-primary)";
    btnIntermediate.style.background = "rgba(0, 240, 255, 0.05)";
    btnBeginner.style.borderColor = "rgba(255,255,255,0.06)";
    btnBeginner.style.background = "none";
    state.knowledgeLevel = "intermediate";
  });

  onboardBtn.addEventListener("click", () => {
    const name = usernameInput.value.trim() || "Scholar";
    state.username = name;
    state.avatar = avatarSelect.value;
    state.targetCareer = careerSelect.value;
    
    // Setup initial state
    state.level = 1;
    state.xp = 0;
    state.streak = 1;
    state.lastActiveDate = new Date().toDateString();
    
    if (state.knowledgeLevel === "intermediate") {
      // Start with foundational programming & AI nodes unlocked as head-start
      state.unlockedNodes = ["prog_fundamentals", "ai_fundamentals"];
      state.xp = 200; // start with some XP
    } else {
      state.unlockedNodes = [];
    }
    
    document.getElementById("onboardingModal").classList.remove("active");
    saveProfile();
    renderDashboard();
    initSkillTree(); // Draw canvas
    
    // Add welcome AI Mentor message
    const welcome = `**AI Mentor:**\n\nWelcome to your learning chamber, **${state.username}**! I have calibrated your study goals to target the **${CAREER_DATA[state.targetCareer].title}** path.\n\nType *"recommend"* in the chat or navigate to the **Skill Tree** to begin!`;
    const mentorBox = document.getElementById("mentorChatMessagesBox");
    mentorBox.innerHTML = `<div class="chat-bubble assistant">${welcome.replace(/\n/g, "<br>")}</div>`;
  });
}

// --- VIEW NAVIGATION ROUTER ---
function initRouting() {
  const menuItems = document.querySelectorAll(".sidebar-menu .menu-item");
  const sections = document.querySelectorAll(".view-section");
  const mobileToggle = document.getElementById("mobileNavToggle");
  const sidebar = document.getElementById("appSidebar");

  menuItems.forEach(item => {
    item.addEventListener("click", () => {
      // Hide mobile nav sidebar if open
      sidebar.classList.remove("open");
      
      const target = item.getAttribute("data-target");
      
      // Update sidebar visual active tab
      menuItems.forEach(el => el.classList.remove("active"));
      item.classList.add("active");
      
      // Toggle visibility of views
      sections.forEach(sec => {
        sec.classList.remove("active");
        if (sec.id === `${target}View`) {
          sec.classList.add("active");
        }
      });

      // Custom reload actions depending on loaded section
      if (target === "dashboard") {
        renderDashboard();
      } else if (target === "skilltree") {
        initSkillTree();
      } else if (target === "career") {
        // Re-init cards to reflect current targetCareer
        initCareerAdvisor();
        renderCareerAdvisor();
      } else if (target === "tools") {
        renderToolsExplorer();
      } else if (target === "community") {
        renderLeaderboard();
      } else if (target === "settings") {
        // Re-sync inputs when revisiting Settings
        document.getElementById("settingsUsernameInput").value = state.username;
        document.getElementById("settingsAvatarSelect").value = state.avatar;
        document.getElementById("settingsTargetCareerSelect").value = state.targetCareer;
      }
    });
  });

  // Mobile navigation panel slide out
  mobileToggle.addEventListener("click", () => {
    sidebar.classList.toggle("open");
  });
}

// --- 1. DASHBOARD VIEW CONTROLLER ---
function renderDashboard() {
  // Quantify stats
  document.getElementById("statNodesUnlocked").innerText = state.unlockedNodes.length;
  document.getElementById("statVibeProjects").innerText = state.completedVibeProjects || 0;
  
  // Estimate total XP ever accumulated
  let accumulated = state.xp;
  for (let i = 1; i < state.level; i++) {
    accumulated += getXPNeededForLevel(i);
  }
  document.getElementById("statTotalXp").innerText = accumulated;

  // Render dynamic AI Mentor suggestion card
  const rec = AI_ENGINE.getRecommendation(state);
  const recBox = document.getElementById("dashMentorRecBox");
  recBox.innerHTML = `<p>${rec.reason}</p><p style="margin-top: 8px; color: var(--text-muted); font-style: italic;">💡 ${rec.advice}</p>`;
  
  const gotoBtn = document.getElementById("dashGotoSkillBtn");
  if (rec.skillId) {
    gotoBtn.innerText = `Unlock ${rec.name}`;
    gotoBtn.disabled = false;
    gotoBtn.onclick = () => {
      // Trigger navigation click to Skill Tree
      document.querySelector('[data-target="skilltree"]').click();
      setTimeout(() => {
        // Open details panel for recommended node
        const nodeEl = document.querySelector(`[data-id="${rec.skillId}"]`);
        if (nodeEl) nodeEl.click();
      }, 300);
    };
  } else {
    gotoBtn.innerText = "All Skills Complete!";
    gotoBtn.disabled = true;
  }

  // Populate dynamic daily missions
  renderDailyMissions();
  
  // Render radar charts
  renderRadarChart();
}

function renderDailyMissions() {
  const list = document.getElementById("dashMissionList");
  list.innerHTML = "";
  
  // Daily Mission presets
  const missions = [
    { id: "mission_quiz", text: "Complete 1 Knowledge Quiz", xp: 40, completed: state.completedMissions.includes("mission_quiz") },
    { id: "mission_explore", text: "Explore 2 tools in Explorer", xp: 30, completed: state.completedMissions.includes("mission_explore") },
    { id: "mission_vibe", text: "Complete 1 Vibe Code project", xp: 50, completed: state.completedMissions.includes("mission_vibe") }
  ];

  missions.forEach(m => {
    const li = document.createElement("li");
    li.className = `mission-item ${m.completed ? 'completed' : ''}`;
    li.innerHTML = `
      <span class="mission-icon">${m.completed ? '✅' : '⚔️'}</span>
      <span>${m.text}</span>
      <span class="mission-xp">+${m.xp} XP</span>
    `;
    list.appendChild(li);
  });
}

// Check off daily missions in state
function completeMission(missionId) {
  if (!state.completedMissions.includes(missionId)) {
    state.completedMissions.push(missionId);
    saveProfile();
    
    // Find XP amount
    let xpVal = 30;
    if (missionId === "mission_quiz") xpVal = 40;
    if (missionId === "mission_vibe") xpVal = 50;
    
    grantXP(xpVal);
    renderDashboard();
  }
}

// Render the Radar chart aggregating unlocked node categories
function renderRadarChart() {
  const ctx = document.getElementById("skillsRadarChart");
  if (!ctx) return;
  
  // Aggregate unlocked nodes by track
  const tracks = ["Programming", "AI Fundamentals", "Data Science", "Prompt Engineering", "Vibe Coding", "AI Tool Mastery"];
  const maxCounts = {
    "Programming": 4,
    "AI Fundamentals": 5,
    "Data Science": 1,
    "Prompt Engineering": 1,
    "Vibe Coding": 1,
    "AI Tool Mastery": 4
  };
  
  const currentCounts = {
    "Programming": 0,
    "AI Fundamentals": 0,
    "Data Science": 0,
    "Prompt Engineering": 0,
    "Vibe Coding": 0,
    "AI Tool Mastery": 0
  };

  state.unlockedNodes.forEach(nodeId => {
    const node = SKILLS_DATA[nodeId];
    if (node && currentCounts[node.track] !== undefined) {
      currentCounts[node.track] += 1;
    }
  });

  const chartData = tracks.map(t => {
    const max = maxCounts[t] || 1;
    const count = currentCounts[t] || 0;
    return Math.min(100, Math.round((count / max) * 100));
  });

  if (skillsChart) {
    skillsChart.destroy();
  }

  // Determine grid color variables depending on dark/light
  const gridColor = state.theme === "light" ? "#cbd5e1" : "#1e293b";
  const labelColor = state.theme === "light" ? "#1e293b" : "#94a3b8";

  skillsChart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: tracks,
      datasets: [{
        label: 'Skill Progression (%)',
        data: chartData,
        backgroundColor: 'rgba(0, 240, 255, 0.15)',
        borderColor: '#00f0ff',
        pointBackgroundColor: '#8b5cf6',
        pointBorderColor: '#fff',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          angleLines: { color: gridColor },
          grid: { color: gridColor },
          pointLabels: {
            color: labelColor,
            font: { family: 'Outfit', size: 11, weight: 'bold' }
          },
          ticks: { display: false },
          suggestedMin: 0,
          suggestedMax: 100
        }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });
}

// --- 2. SKILL TREE CONTROLLER ---
function initSkillTree() {
  const canvas = document.getElementById("treeCanvas");
  const svg = document.getElementById("treeConnectionsSvg");
  if (!canvas || !svg) return;
  
  // Clear old dynamic nodes, keeping SVG overlay
  const oldNodes = canvas.querySelectorAll(".skill-node, .skill-node-label");
  oldNodes.forEach(el => el.remove());
  
  // Set dimensions
  svg.setAttribute("width", "1020");
  svg.setAttribute("height", "720");
  
  // First layer: Draw connection lines matching relationships
  svg.innerHTML = "";
  
  for (let key in SKILLS_DATA) {
    const node = SKILLS_DATA[key];
    const prereqs = node.prerequisites || [];
    
    prereqs.forEach(prKey => {
      const prNode = SKILLS_DATA[prKey];
      if (prNode) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", prNode.x);
        line.setAttribute("y1", prNode.y);
        line.setAttribute("x2", node.x);
        line.setAttribute("y2", node.y);
        
        // Determine line connection glow styling
        let statusClass = "locked";
        if (state.unlockedNodes.includes(key) && state.unlockedNodes.includes(prKey)) {
          statusClass = "unlocked";
        } else if (state.unlockedNodes.includes(prKey)) {
          statusClass = "available";
        }
        
        line.setAttribute("class", `connection-line ${statusClass}`);
        svg.appendChild(line);
      }
    });
  }

  // Second layer: Draw skill nodes
  for (let key in SKILLS_DATA) {
    const node = SKILLS_DATA[key];
    
    // Evaluate status
    let statusClass = "locked";
    if (state.unlockedNodes.includes(key)) {
      statusClass = "unlocked";
    } else {
      // Check if prerequisites are met
      const prereqsMet = node.prerequisites.every(pr => state.unlockedNodes.includes(pr));
      if (prereqsMet) {
        statusClass = "available";
      }
    }
    
    // Create button node bubble
    const nodeEl = document.createElement("button");
    nodeEl.className = `skill-node ${statusClass}`;
    nodeEl.style.left = `${node.x}px`;
    nodeEl.style.top = `${node.y}px`;
    nodeEl.setAttribute("data-id", node.id);
    nodeEl.setAttribute("aria-label", `Skill node ${node.label}, status is ${statusClass}`);
    nodeEl.innerHTML = node.icon;
    
    // Create label tag under the button
    const labelEl = document.createElement("div");
    labelEl.className = "skill-node-label";
    labelEl.style.left = `${node.x - 70}px`;
    labelEl.style.top = `${node.y + 42}px`;
    labelEl.innerText = node.label;
    
    // Click listener to load details
    nodeEl.addEventListener("click", () => {
      openNodeDrawer(node.id);
    });

    canvas.appendChild(nodeEl);
    canvas.appendChild(labelEl);
  }
}

// Side Info drawer managers
function openNodeDrawer(nodeId) {
  const node = SKILLS_DATA[nodeId];
  if (!node) return;
  
  currentDrawerNodeId = nodeId;
  const drawer = document.getElementById("nodeDetailsDrawer");
  
  document.getElementById("drawerIcon").innerText = node.icon;
  document.getElementById("drawerTrack").innerText = node.track;
  document.getElementById("drawerTitle").innerText = node.label;
  document.getElementById("drawerDescription").innerText = node.description;
  
  // Setup lesson slides navigation
  currentLessonSlides = node.lesson.slides || [];
  currentLessonSlideIndex = 0;
  renderLessonSlide();
  
  // Render Quiz challenges or code compilers
  const isUnlocked = state.unlockedNodes.includes(nodeId);
  const quizPanel = document.getElementById("nodeInteractivePanel");
  
  if (isUnlocked) {
    quizPanel.style.display = "block";
    document.getElementById("interactivePanelTitle").innerText = "🎉 Node Completed!";
    document.getElementById("quizContainer").innerHTML = `<p style="font-size:13px; line-height:1.5; color:var(--color-success);">Excellent! You have mastered this skill. Lesson materials can be reviewed anytime.</p>`;
    document.getElementById("codeChallengeContainer").style.display = "none";
    
    // Disable unlock button since already active
    const unlockBtn = document.getElementById("nodeUnlockBtn");
    unlockBtn.innerText = "Mastered ✓";
    unlockBtn.disabled = true;
  } else {
    // Check if available
    const prereqsMet = node.prerequisites.every(pr => state.unlockedNodes.includes(pr));
    const unlockBtn = document.getElementById("nodeUnlockBtn");
    
    if (prereqsMet) {
      quizPanel.style.display = "block";
      unlockBtn.disabled = false;
      unlockBtn.innerText = `Unlock Skill (Cost: ${node.cost} XP)`;
      
      // Load specific challenge type
      if (node.challenge && node.challenge.type === "code") {
        setupCodeChallenge(node);
      } else {
        setupQuizChallenge(node);
      }
    } else {
      // Locked
      quizPanel.style.display = "none";
      unlockBtn.disabled = true;
      
      const missing = node.prerequisites.filter(pr => !state.unlockedNodes.includes(pr));
      const missingLabels = missing.map(m => SKILLS_DATA[m]?.label).join(", ");
      unlockBtn.innerText = `Prerequisites Missing: ${missingLabels}`;
    }
  }

  // Slide drawer into view
  drawer.classList.add("open");
}

// Set drawer closed
document.getElementById("drawerCloseBtn").addEventListener("click", () => {
  document.getElementById("nodeDetailsDrawer").classList.remove("open");
});

// Slides navigation handlers
function renderLessonSlide() {
  document.getElementById("lessonSlideTitle").innerText = `Slide ${currentLessonSlideIndex + 1} / ${currentLessonSlides.length}`;
  document.getElementById("lessonSlideText").innerText = currentLessonSlides[currentLessonSlideIndex];
  document.getElementById("lessonSlideIndex").innerText = `Progress: ${currentLessonSlideIndex + 1} of ${currentLessonSlides.length}`;
}

document.getElementById("lessonPrevBtn").addEventListener("click", () => {
  if (currentLessonSlideIndex > 0) {
    currentLessonSlideIndex--;
    renderLessonSlide();
  }
});

document.getElementById("lessonNextBtn").addEventListener("click", () => {
  if (currentLessonSlideIndex < currentLessonSlides.length - 1) {
    currentLessonSlideIndex++;
    renderLessonSlide();
  }
});

// Setup Quiz elements inside drawer
function setupQuizChallenge(node) {
  document.getElementById("interactivePanelTitle").innerText = "⚔️ Knowledge Quiz";
  document.getElementById("quizContainer").style.display = "block";
  document.getElementById("codeChallengeContainer").style.display = "none";
  
  const quizObj = node.quiz[0]; // Load first quiz option
  document.getElementById("quizQuestion").innerText = quizObj.question;
  
  const optionsGroup = document.getElementById("quizOptionsGroup");
  optionsGroup.innerHTML = "";
  
  quizObj.options.forEach((opt, idx) => {
    const btn = document.createElement("button");
    btn.className = "quiz-option";
    btn.innerText = opt;
    btn.addEventListener("click", () => {
      // Disable options interaction
      const allBtns = optionsGroup.querySelectorAll(".quiz-option");
      allBtns.forEach(b => b.disabled = true);
      
      if (idx === quizObj.answer) {
        btn.classList.add("correct");
        grantXP(40);
        completeMission("mission_quiz");
        
        // Show AI explanation details
        const exp = document.createElement("div");
        exp.style.fontSize = "12px";
        exp.style.marginTop = "8px";
        exp.style.color = "var(--color-success)";
        exp.innerHTML = `<strong>Correct!</strong> ${quizObj.explanation}`;
        optionsGroup.appendChild(exp);
      } else {
        btn.classList.add("incorrect");
        
        // Show correct indicator too
        allBtns[quizObj.answer].classList.add("correct");
        
        const exp = document.createElement("div");
        exp.style.fontSize = "12px";
        exp.style.marginTop = "8px";
        exp.style.color = "var(--color-danger)";
        exp.innerHTML = `<strong>Incorrect.</strong> ${quizObj.explanation}`;
        optionsGroup.appendChild(exp);
      }
    });
    optionsGroup.appendChild(btn);
  });
}

// Setup coding sandbox fields
function setupCodeChallenge(node) {
  document.getElementById("interactivePanelTitle").innerText = "💻 Coding Sandbox";
  document.getElementById("quizContainer").style.display = "none";
  document.getElementById("codeChallengeContainer").style.display = "block";
  
  document.getElementById("codeChallengeInstruction").innerText = node.challenge.instruction;
  const editor = document.getElementById("codeChallengeEditor");
  editor.value = node.challenge.template;
  
  const feedback = document.getElementById("codeChallengeFeedback");
  feedback.style.display = "none";
  feedback.innerHTML = "";

  document.getElementById("codeChallengeVerifyBtn").onclick = () => {
    const res = AI_ENGINE.checkCodeChallenge(node.id, editor.value);
    feedback.style.display = "block";
    
    if (res.success) {
      feedback.style.color = "var(--color-success)";
      feedback.innerHTML = res.feedback;
      grantXP(40);
      completeMission("mission_quiz");
      document.getElementById("codeChallengeVerifyBtn").disabled = true;
    } else {
      feedback.style.color = "var(--color-danger)";
      feedback.innerHTML = res.feedback;
    }
  };
}

// Unlocking nodes click
document.getElementById("nodeUnlockBtn").addEventListener("click", () => {
  const nodeId = currentDrawerNodeId;
  const node = SKILLS_DATA[nodeId];
  if (!node) return;
  
  if (state.unlockedNodes.includes(nodeId)) return;
  
  // Check requirements
  const prereqsMet = node.prerequisites.every(pr => state.unlockedNodes.includes(pr));
  if (!prereqsMet) return;
  
  if (state.xp >= node.cost) {
    state.xp -= node.cost;
    state.unlockedNodes.push(nodeId);
    saveProfile();
    
    // Play confetti explosion!
    if (typeof confetti === 'function') {
      confetti({ particleCount: 60, spread: 40 });
    }
    
    // Redraw and update HUD
    initSkillTree();
    openNodeDrawer(nodeId);
    updateHUD();
    renderDashboard();
  } else {
    alert(`Insufficient Experience Points (XP)! You need ${node.cost} XP, but currently have ${state.xp} XP. Complete Daily Missions or quizzes to acquire XP first!`);
  }
});

// --- 3. MENTOR CHAT CONTROLLER ---
function initMentorChat() {
  const sendBtn = document.getElementById("mentorChatSendBtn");
  const inputEl = document.getElementById("mentorChatInput");
  const msgBox = document.getElementById("mentorChatMessagesBox");

  function sendMessage() {
    const text = inputEl.value.trim();
    if (!text) return;
    
    // Append user message
    msgBox.innerHTML += `
      <div class="chat-bubble user">
        <strong>${state.username}:</strong><br>
        ${text}
      </div>
    `;
    inputEl.value = "";
    msgBox.scrollTop = msgBox.scrollHeight;
    
    // Append simulated AI typing indicator
    const typing = document.createElement("div");
    typing.className = "typing-bubble";
    typing.id = "chatMentorTyping";
    typing.innerHTML = `<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>`;
    msgBox.appendChild(typing);
    msgBox.scrollTop = msgBox.scrollHeight;

    // Trigger AI response after short delay
    setTimeout(() => {
      document.getElementById("chatMentorTyping")?.remove();
      const response = AI_ENGINE.getChatResponse(text, state);
      
      msgBox.innerHTML += `
        <div class="chat-bubble assistant">
          ${response.replace(/\n/g, "<br>")}
        </div>
      `;
      msgBox.scrollTop = msgBox.scrollHeight;
    }, 1000);
  }

  sendBtn.addEventListener("click", sendMessage);
  inputEl.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });

  // Action shortcuts
  document.getElementById("mentorActionRecBtn").addEventListener("click", () => {
    inputEl.value = "Recommend my next skill node";
    sendMessage();
  });

  document.getElementById("mentorActionScheduleBtn").addEventListener("click", () => {
    inputEl.value = "Generate a study schedule for 3 hours";
    sendMessage();
  });

  document.getElementById("mentorActionGapsBtn").addEventListener("click", () => {
    inputEl.value = "Analyze my career gaps";
    sendMessage();
  });
}

// --- 4. CAREER ADVISOR CONTROLLER ---
function initCareerAdvisor() {
  const cardsGroup = document.getElementById("careerCardsSelector");
  if (!cardsGroup) return;
  
  cardsGroup.innerHTML = "";
  
  for (let key in CAREER_DATA) {
    const car = CAREER_DATA[key];
    const card = document.createElement("div");
    card.className = `card-glass career-card ${state.targetCareer === key ? 'active' : ''}`;
    card.setAttribute("data-career", key);
    card.innerHTML = `
      <div class="career-card-icon">${car.icon}</div>
      <div>
        <h3 style="font-size:15px; font-weight:700;">${car.title}</h3>
        <span style="font-size:11px; color:var(--text-muted);">${car.salary} avg</span>
      </div>
    `;
    
    card.addEventListener("click", () => {
      const allCards = cardsGroup.querySelectorAll(".career-card");
      allCards.forEach(c => c.classList.remove("active"));
      card.classList.add("active");
      
      state.targetCareer = key;
      saveProfile();
      renderCareerAdvisor();
    });

    cardsGroup.appendChild(card);
  }
}

function renderCareerAdvisor() {
  const careerId = state.targetCareer || "software_developer";
  const analysis = AI_ENGINE.analyzeCareerGap(state, careerId);
  if (!analysis) return;
  
  const careerDef = CAREER_DATA[careerId];
  
  document.getElementById("activeCareerTitle").innerText = careerDef.title;
  document.getElementById("activeCareerDescription").innerText = careerDef.description;
  document.getElementById("activeCareerSalary").innerText = careerDef.salary;
  
  // Roadmap percent
  document.getElementById("activeCareerProgressPercent").innerText = `${analysis.percent}%`;
  document.getElementById("activeCareerProgressFill").style.width = `${analysis.percent}%`;
  
  // Populate Study steps
  const stepsList = document.getElementById("activeCareerRoadmapSteps");
  stepsList.innerHTML = "";
  analysis.roadmap.forEach(step => {
    const li = document.createElement("li");
    li.innerText = step;
    stepsList.appendChild(li);
  });

  // Populate Skill badge grid
  const list = document.getElementById("activeCareerSkillsList");
  list.innerHTML = "";
  
  careerDef.requiredSkills.forEach(skillId => {
    const isUnlocked = state.unlockedNodes.includes(skillId);
    const label = SKILLS_DATA[skillId]?.label || skillId;
    
    const badge = document.createElement("div");
    badge.className = `gap-skill-badge ${isUnlocked ? 'unlocked' : 'locked'}`;
    badge.innerHTML = `
      <span>${SKILLS_DATA[skillId]?.icon || '💻'} ${label}</span>
      <span style="font-weight:700; font-size:11px;">${isUnlocked ? '✓ MASTERED' : '❌ GAPS'}</span>
    `;
    list.appendChild(badge);
  });
}

// --- 5. AI TOOLS EXPLORER ---
function initToolsExplorer() {
  const tabs = document.querySelectorAll("#toolsFilterTabs .filter-tab");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      renderToolsExplorer();
    });
  });
}

function renderToolsExplorer() {
  const grid = document.getElementById("toolsGrid");
  if (!grid) return;
  
  grid.innerHTML = "";
  
  const activeTab = document.querySelector("#toolsFilterTabs .filter-tab.active");
  const filterCat = activeTab.getAttribute("data-cat");
  
  const filtered = TOOLS_DATA.filter(t => {
    if (filterCat === "All") return true;
    if (filterCat === "Research Tools") {
      return t.category.includes("Research") || t.category.includes("Data Science");
    }
    return t.category.includes(filterCat);
  });

  filtered.forEach(tool => {
    const isExplored = state.exploredTools.includes(tool.id);
    const card = document.createElement("div");
    card.className = "card-glass accent-glow-primary";
    card.innerHTML = `
      <div class="tool-card-head">
        <h3 style="font-size:18px; font-weight:800;">${tool.name}</h3>
        <span class="tool-category-label">${tool.pricing}</span>
      </div>
      <p style="font-size:13px; color:var(--text-muted); line-height:1.4; margin-bottom:12px;">${tool.useCase}</p>
      
      <div style="font-size:12px; margin-bottom:14px; line-height:1.4;">
        <span style="color:var(--color-success); font-weight:700;">✓ Strengths:</span> ${tool.strengths}<br>
        <span style="color:var(--color-danger); font-weight:700;">✗ Weaknesses:</span> ${tool.weaknesses}
      </div>

      <div style="display:flex; gap:10px; margin-top:auto;">
        <a href="${tool.link}" target="_blank" class="btn-action" style="text-align:center; padding:8px; font-size:12px; background:rgba(255,255,255,0.03); border:1px solid var(--border-glow); color:var(--text-main); flex:1;">Visit Site ↗</a>
        <button class="btn-action explore-tool-btn" data-tool="${tool.id}" style="padding:8px; font-size:12px; flex:1;">
          ${isExplored ? '✓ Explored' : '🔬 Mark Explored'}
        </button>
      </div>
    `;

    // Click listener to mark explored
    card.querySelector(".explore-tool-btn").addEventListener("click", (e) => {
      const btn = e.target;
      if (!state.exploredTools.includes(tool.id)) {
        state.exploredTools.push(tool.id);
        
        // Check if explored 2 tools for the daily mission
        const count = state.exploredTools.length;
        if (count >= 2) {
          completeMission("mission_explore");
        }
        
        saveProfile();
        btn.innerText = "✓ Explored";
        grantXP(20);
        renderToolsExplorer();
      }
    });

    grid.appendChild(card);
  });
}

// --- 6. VIBE CODING WORKSPACE ---
let vibeIntervalTimer = null;
let currentVibeProject = null;

function initVibeCoding() {
  const submitBtn = document.getElementById("vibeSubmitBtn");
  const inputEl = document.getElementById("vibePromptInput");
  const completeBtn = document.getElementById("vibeCompleteBtn");

  submitBtn.addEventListener("click", () => {
    const prompt = inputEl.value.trim();
    if (!prompt) return;
    
    // Clear typing clocks
    if (vibeIntervalTimer) clearInterval(vibeIntervalTimer);
    
    // Generate simulated files & milestones
    currentVibeProject = AI_ENGINE.generateProject(prompt, state);
    
    // Render file tree
    const fileList = document.getElementById("vibeFileList");
    fileList.innerHTML = "";
    
    Object.keys(currentVibeProject.files).forEach((filename, idx) => {
      const li = document.createElement("li");
      li.className = `file-item ${idx === 0 ? 'active' : ''}`;
      li.innerHTML = `📄 ${filename}`;
      li.onclick = () => {
        const allItems = fileList.querySelectorAll(".file-item");
        allItems.forEach(i => i.classList.remove("active"));
        li.classList.add("active");
        
        // Show file content (static check)
        const fileContent = currentVibeProject.files[filename];
        document.getElementById("vibeActiveFileName").innerText = filename;
        document.getElementById("vibeActiveFileType").innerText = filename.split(".").pop().toUpperCase();
        document.getElementById("vibeEditorOutput").innerText = fileContent;
      };
      fileList.appendChild(li);
    });

    // Render initial milestones
    renderVibeMilestones();
    
    // Start character by character typing simulation
    simulateVibeCoding();
    inputEl.value = "";
  });

  completeBtn.addEventListener("click", () => {
    if (currentVibeProject) {
      grantXP(currentVibeProject.xpReward || 150);
      state.completedVibeProjects = (state.completedVibeProjects || 0) + 1;
      
      completeMission("mission_vibe");
      
      saveProfile();
      renderDashboard();
      
      // Reset view
      document.getElementById("vibeFileList").innerHTML = `<li style="font-size:12px; color:var(--text-muted); font-style:italic;">No files generated.</li>`;
      document.getElementById("vibeMilestoneList").innerHTML = "";
      document.getElementById("vibeEditorOutput").innerText = "Project complete! Enter a new prompt to start next Vibe Code.";
      completeBtn.disabled = true;
      currentVibeProject = null;
      
      if (typeof confetti === 'function') {
        confetti({ particleCount: 50, spread: 60 });
      }
    }
  });
}

function renderVibeMilestones() {
  const list = document.getElementById("vibeMilestoneList");
  list.innerHTML = "";
  
  if (!currentVibeProject) return;
  
  currentVibeProject.milestones.forEach(m => {
    const li = document.createElement("li");
    li.className = `mission-item ${m.done ? 'completed' : ''}`;
    li.innerHTML = `
      <span class="mission-icon">${m.done ? '✅' : '⏳'}</span>
      <span>${m.title}</span>
    `;
    list.appendChild(li);
  });
}

function simulateVibeCoding() {
  const firstFilename = Object.keys(currentVibeProject.files)[0];
  const fullContent = currentVibeProject.files[firstFilename];
  
  document.getElementById("vibeActiveFileName").innerText = firstFilename;
  document.getElementById("vibeActiveFileType").innerText = firstFilename.split(".").pop().toUpperCase();
  
  const displayArea = document.getElementById("vibeEditorOutput");
  displayArea.innerText = "";
  
  let charIdx = 0;
  // Speed parameter (types 3 characters per interval)
  vibeIntervalTimer = setInterval(() => {
    if (charIdx < fullContent.length) {
      displayArea.innerText += fullContent.substring(charIdx, charIdx + 4);
      charIdx += 4;
      displayArea.scrollTop = displayArea.scrollHeight;
    } else {
      clearInterval(vibeIntervalTimer);
      
      // Mark all milestones completed sequentially
      currentVibeProject.milestones.forEach(m => m.done = true);
      renderVibeMilestones();
      
      // Enable complete button
      document.getElementById("vibeCompleteBtn").disabled = false;
    }
  }, 12);
}

// --- 7. AI GLOSSARY HUB CONTROLLER ---
function initGlossary() {
  const searchInput = document.getElementById("glossarySearchInput");
  const listEl = document.getElementById("glossarySidebarList");
  
  function renderList(query = "") {
    listEl.innerHTML = "";
    
    for (let key in GLOSSARY_DATA) {
      const item = GLOSSARY_DATA[key];
      if (item.term.toLowerCase().includes(query.toLowerCase()) || item.definition.toLowerCase().includes(query.toLowerCase())) {
        const div = document.createElement("div");
        div.className = "glossary-list-item";
        div.innerText = item.term;
        div.addEventListener("click", () => {
          // Update active layout
          const allItems = listEl.querySelectorAll(".glossary-list-item");
          allItems.forEach(i => i.classList.remove("active"));
          div.classList.add("active");
          
          showGlossaryTerm(key);
        });
        listEl.appendChild(div);
      }
    }
    
    // Select first automatically if matches exist
    if (listEl.firstChild) {
      listEl.firstChild.click();
    }
  }

  searchInput.addEventListener("input", (e) => {
    renderList(e.target.value);
  });
  
  renderList();
}

function showGlossaryTerm(key) {
  const item = GLOSSARY_DATA[key];
  if (!item) return;
  
  document.getElementById("glossaryTermTitle").innerText = item.term;
  
  const categoryLabel = document.getElementById("glossaryTermCategory");
  categoryLabel.innerText = item.category;
  categoryLabel.style.display = "block";
  
  document.getElementById("glossaryTermDefinition").innerText = item.definition;
  document.getElementById("glossaryTermExplanation").innerText = item.explanation;
  
  // Related concept tags
  const tagsContainer = document.getElementById("glossaryTermRelatedContainer");
  const tagsList = document.getElementById("glossaryTermRelatedTags");
  tagsList.innerHTML = "";
  
  if (item.related && item.related.length > 0) {
    tagsContainer.style.display = "block";
    item.related.forEach(tag => {
      const span = document.createElement("span");
      span.className = "tool-category-label";
      span.style.background = "rgba(0, 240, 255, 0.08)";
      span.style.color = "var(--color-primary)";
      span.style.cursor = "pointer";
      span.innerText = tag;
      span.onclick = () => {
        // Find if this tag matches key in glossary
        for (let k in GLOSSARY_DATA) {
          if (GLOSSARY_DATA[k].term.toLowerCase().includes(tag.toLowerCase())) {
            // Find in sidebar list and trigger click
            const items = document.querySelectorAll(".glossary-list-item");
            items.forEach(itemEl => {
              if (itemEl.innerText === GLOSSARY_DATA[k].term) {
                itemEl.click();
              }
            });
            break;
          }
        }
      };
      tagsList.appendChild(span);
    });
  } else {
    tagsContainer.style.display = "none";
  }
}

// --- 8. COMMUNITY LOUNGE CONTROLLER ---
let mockLeaderboard = [...LEADERBOARD_INITIAL];

function initCommunity() {
  const shareBtn = document.getElementById("communityPostSubmitBtn");
  const inputEl = document.getElementById("communityPostInput");
  
  shareBtn.addEventListener("click", () => {
    const text = inputEl.value.trim();
    if (!text) return;
    
    // Add custom post
    const newPost = {
      id: `post_${Date.now()}`,
      author: state.username,
      avatar: state.avatar,
      title: getRankTitle(state.level),
      content: text,
      likes: 0,
      comments: 0,
      timestamp: "Just now",
      category: "General Lounge"
    };
    
    COMMUNITY_FEED_INITIAL.unshift(newPost);
    renderCommunityFeed();
    inputEl.value = "";
    
    // Award minor XP for contributing
    grantXP(15);
  });

  renderLeaderboard();
  renderCommunityFeed();
  renderStudyGroups();
}

function renderLeaderboard() {
  const tbody = document.getElementById("leaderboardTableBody");
  if (!tbody) return;
  tbody.innerHTML = "";
  
  // Dynamic calculation for player
  const playerXPAccumulated = state.xp + (state.level - 1) * 1000 * 1.2;
  const player = {
    rank: 0,
    name: state.username + " (You)",
    title: getRankTitle(state.level),
    level: state.level,
    xp: playerXPAccumulated,
    avatar: state.avatar,
    active: true
  };
  
  // Merge, sort, and re-rank
  let allRanks = mockLeaderboard.filter(c => !c.active);
  allRanks.push(player);
  allRanks.sort((a, b) => b.xp - a.xp);
  
  allRanks.forEach((item, index) => {
    const tr = document.createElement("tr");
    if (item.active) tr.className = "user-row";
    
    tr.innerHTML = `
      <td><strong>#${index + 1}</strong></td>
      <td>
        <div style="display:flex; gap:10px; align-items:center;">
          <span>${item.avatar}</span>
          <div>
            <div style="font-weight:700;">${item.name}</div>
            <div style="font-size:10px; color:var(--text-muted);">${item.title}</div>
          </div>
        </div>
      </td>
      <td>Lvl ${item.level}</td>
      <td style="font-family:var(--font-mono); color:var(--color-primary);">${Math.round(item.xp)} XP</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderCommunityFeed() {
  const feed = document.getElementById("communityPostsFeed");
  if (!feed) return;
  
  feed.innerHTML = "";
  
  COMMUNITY_FEED_INITIAL.forEach(post => {
    const card = document.createElement("div");
    card.className = "card-glass post-card";
    card.innerHTML = `
      <div class="post-author-row">
        <div class="post-author-avatar">${post.avatar}</div>
        <div class="post-meta">
          <div class="post-author-name">${post.author}</div>
          <div class="post-author-title">${post.title}</div>
        </div>
        <div class="post-time">${post.timestamp}</div>
      </div>
      <p style="font-size:14px; line-height:1.5; color:var(--text-main);">${post.content}</p>
      <div class="post-actions">
        <span class="like-btn">❤️ Like (${post.likes})</span>
        <span>💬 Reply (${post.comments})</span>
        <span style="margin-left:auto;" class="tool-category-label">${post.category}</span>
      </div>
    `;
    
    // Wire like click
    card.querySelector(".like-btn").onclick = (e) => {
      post.likes += 1;
      e.target.innerText = `❤️ Like (${post.likes})`;
    };
    
    feed.appendChild(card);
  });
}

function renderStudyGroups() {
  const container = document.getElementById("communityStudyGroups");
  if (!container) return;
  container.innerHTML = "";
  
  STUDY_GROUPS.forEach(group => {
    const isJoined = state.joinedGroups.includes(group.id);
    const div = document.createElement("div");
    div.className = "gap-skill-badge";
    div.style.flexDirection = "column";
    div.style.alignItems = "flex-start";
    div.style.gap = "8px";
    div.innerHTML = `
      <div style="display:flex; justify-content:space-between; width:100%; align-items:center;">
        <h4 style="font-size:14px; font-weight:700;">${group.name}</h4>
        <span style="font-size:11px; color:var(--text-muted);">${group.members} students</span>
      </div>
      <p style="font-size:12px; color:var(--text-muted); line-height:1.4;">${group.description}</p>
      <button class="btn-action join-group-btn" style="width:auto; padding:6px 12px; font-size:11px; margin-top:4px;">
        ${isJoined ? '🚪 Leave Guild' : '⚔️ Join Guild'}
      </button>
    `;
    
    div.querySelector(".join-group-btn").onclick = () => {
      if (isJoined) {
        state.joinedGroups = state.joinedGroups.filter(id => id !== group.id);
        group.members -= 1;
      } else {
        state.joinedGroups.push(group.id);
        group.members += 1;
        grantXP(15);
      }
      saveProfile();
      renderStudyGroups();
    };

    container.appendChild(div);
  });
}

// --- 9. SETTINGS CONTROLLER ---
function initSettings() {
  const usernameInput = document.getElementById("settingsUsernameInput");
  const avatarSelect = document.getElementById("settingsAvatarSelect");
  const careerSelect = document.getElementById("settingsTargetCareerSelect");
  
  // Set initial settings inputs
  usernameInput.value = state.username;
  avatarSelect.value = state.avatar;
  
  // Populate career selects
  careerSelect.innerHTML = "";
  for (let k in CAREER_DATA) {
    const op = document.createElement("option");
    op.value = k;
    op.innerText = CAREER_DATA[k].title;
    careerSelect.appendChild(op);
  }
  careerSelect.value = state.targetCareer;

  // Save changes click
  document.getElementById("settingsSaveProfileBtn").addEventListener("click", () => {
    state.username = usernameInput.value.trim() || "NeoCoder";
    state.avatar = avatarSelect.value;
    state.targetCareer = careerSelect.value;
    
    saveProfile();
    updateHUD();
    renderDashboard();
    alert("Character settings successfully synchronized!");
  });

  // Export JSON clipboard data
  document.getElementById("settingsExportDataBtn").addEventListener("click", () => {
    const dataStr = JSON.stringify(state);
    navigator.clipboard.writeText(dataStr).then(() => {
      alert("Success! Profile progression data copied to clipboard as JSON text. Paste it safely on another device.");
    }).catch(err => {
      // Fallback display
      alert("Backup JSON string: \n\n" + dataStr);
    });
  });

  // Import JSON configuration
  const importBtn = document.getElementById("settingsImportDataBtn");
  const importArea = document.getElementById("settingsImportDataArea");
  const importConfirmBtn = document.getElementById("settingsImportConfirmBtn");
  
  importBtn.addEventListener("click", () => {
    importArea.style.display = "block";
    importConfirmBtn.style.display = "block";
  });

  importConfirmBtn.addEventListener("click", () => {
    try {
      const data = JSON.parse(importArea.value.trim());
      if (data && typeof data === 'object' && data.username && data.unlockedNodes) {
        state = data;
        saveProfile();
        
        // Reload page
        alert("Success! Synchronization completed. Reloading simulator dashboard...");
        window.location.reload();
      } else {
        alert("Error! Invalid profile JSON schema. Verify structure properties.");
      }
    } catch (e) {
      alert("Syntax Error! Parsing failed. Verify copied text format.");
    }
  });

  // Wipe Profile click
  document.getElementById("settingsResetProgressBtn").addEventListener("click", () => {
    if (confirm("CRITICAL RESET: Are you absolutely certain you want to wipe all local stats, badges, and learning logs? This action cannot be reversed.")) {
      localStorage.removeItem("rpg_student_profile");
      alert("Reset complete. Restarting onboarding program...");
      window.location.reload();
    }
  });
}

// Level Up close overlay handler
document.getElementById("levelUpModalCloseBtn").addEventListener("click", () => {
  document.getElementById("levelUpModal").classList.remove("active");
});
