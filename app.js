// Safe in-app toast notification for iframe environment (avoiding window.alert blocks)
window.alert = function(msg) {
  let toast = document.getElementById("rpgToastNotification");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "rpgToastNotification";
    toast.style.cssText = "position:fixed;bottom:24px;right:24px;background:#1e293b;color:#f8fafc;padding:12px 20px;border-radius:10px;border:1px solid #06b6d4;box-shadow:0 10px 25px rgba(0,0,0,0.5);z-index:99999;font-size:14px;max-width:360px;line-height:1.4;transition:opacity 0.3s ease;pointer-events:none;";
    document.body.appendChild(toast);
  }
  toast.innerText = msg;
  toast.style.opacity = "1";
  toast.style.display = "block";
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => { if (toast) toast.style.display = "none"; }, 300);
  }, 4000);
};

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
  tasks: [],
  subjects: [],
  studySessions: [],
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
  initDashboard();
  initTaskManager();
  initSubjectsManager();
  initTimerManager();
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

// --- UTILITY: HTML ESCAPING FOR XSS PREVENTION ---
function escapeHTML(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// --- UTILITY: CALENDAR DAY DIFFERENCE (NORMALIZED AT MIDNIGHT) ---
function getCalendarDayDiff(dateStr1, dateStr2) {
  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 999;
  const utc1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());
  const utc2 = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate());
  return Math.floor(Math.abs(utc1 - utc2) / (1000 * 60 * 60 * 24));
}

// --- UTILITY: PROFILE SCHEMA VALIDATOR ---
function validateProfileSchema(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return { valid: false, error: "Root data must be a valid JSON object." };
  }
  
  const rawName = typeof data.username === "string" ? data.username.trim() : "";
  if (!rawName) {
    return { valid: false, error: "Profile must contain a non-empty username." };
  }
  const cleanUsername = rawName.slice(0, 30);
  
  const level = Number.isInteger(data.level) && data.level > 0 ? data.level : 1;
  const xp = typeof data.xp === "number" && !isNaN(data.xp) && data.xp >= 0 ? Math.floor(data.xp) : 0;
  const streak = Number.isInteger(data.streak) && data.streak >= 0 ? data.streak : 1;
  
  const unlockedNodes = Array.isArray(data.unlockedNodes) ? data.unlockedNodes.filter(id => typeof id === "string") : [];
  const completedMissions = Array.isArray(data.completedMissions) ? data.completedMissions.filter(id => typeof id === "string") : [];
  const exploredTools = Array.isArray(data.exploredTools) ? data.exploredTools.filter(id => typeof id === "string") : [];
  const joinedGroups = Array.isArray(data.joinedGroups) ? data.joinedGroups.filter(id => typeof id === "string") : [];
  const completedVibeProjects = typeof data.completedVibeProjects === "number" && !isNaN(data.completedVibeProjects) && data.completedVibeProjects >= 0 ? Math.floor(data.completedVibeProjects) : 0;
  
  // Validate tasks array
  const tasks = Array.isArray(data.tasks) ? data.tasks.filter(t => t && typeof t === "object" && typeof t.title === "string").map(t => ({
    id: typeof t.id === "string" ? t.id : ("task_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5)),
    title: String(t.title).trim().slice(0, 100),
    subject: typeof t.subject === "string" && t.subject.trim() ? t.subject.trim().slice(0, 50) : "General Study",
    priority: ["high", "medium", "low"].includes(t.priority) ? t.priority : "medium",
    dueDate: typeof t.dueDate === "string" && !isNaN(new Date(t.dueDate).getTime()) ? t.dueDate : new Date().toISOString().split("T")[0],
    completed: Boolean(t.completed),
    notes: typeof t.notes === "string" ? t.notes.slice(0, 500) : "",
    createdAt: typeof t.createdAt === "string" ? t.createdAt : new Date().toISOString(),
    completedAt: t.completedAt ? String(t.completedAt) : null
  })) : [];

  // Validate subjects and syllabus topics array
  const subjects = Array.isArray(data.subjects) ? data.subjects.filter(s => s && typeof s === "object" && typeof s.name === "string").map(s => {
    const rawTopics = Array.isArray(s.topics) ? s.topics.filter(tp => tp && typeof tp === "object" && typeof tp.title === "string").map(tp => ({
      id: typeof tp.id === "string" ? tp.id : ("topic_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5)),
      title: String(tp.title).trim().slice(0, 80),
      completed: Boolean(tp.completed),
      estimatedHours: typeof tp.estimatedHours === "number" && !isNaN(tp.estimatedHours) && tp.estimatedHours > 0 ? Math.floor(tp.estimatedHours) : 2,
      completedAt: tp.completedAt ? String(tp.completedAt) : null
    })) : [];

    return {
      id: typeof s.id === "string" ? s.id : ("subj_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5)),
      name: String(s.name).trim().slice(0, 60),
      code: typeof s.code === "string" ? s.code.trim().slice(0, 20) : "",
      color: ["cyan", "purple", "amber", "emerald", "rose"].includes(s.color) ? s.color : "cyan",
      examDate: typeof s.examDate === "string" && !isNaN(new Date(s.examDate).getTime()) ? s.examDate : "",
      notes: typeof s.notes === "string" ? s.notes.slice(0, 500) : "",
      topics: rawTopics,
      createdAt: typeof s.createdAt === "string" ? s.createdAt : new Date().toISOString()
    };
  }) : [];

  // Validate studySessions array
  const studySessions = Array.isArray(data.studySessions) ? data.studySessions.filter(s => s && typeof s === "object").map(s => ({
    id: typeof s.id === "string" ? s.id : ("session_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5)),
    subject: typeof s.subject === "string" && s.subject.trim() ? s.subject.trim().slice(0, 50) : "General Study",
    durationMinutes: typeof s.durationMinutes === "number" && !isNaN(s.durationMinutes) && s.durationMinutes > 0 ? Math.floor(s.durationMinutes) : 0,
    date: typeof s.date === "string" ? s.date : new Date().toISOString().split("T")[0],
    completedAt: typeof s.completedAt === "string" ? s.completedAt : new Date().toISOString()
  })) : [];

  return {
    valid: true,
    sanitized: {
      username: cleanUsername,
      avatar: typeof data.avatar === "string" ? data.avatar : "🧙‍♂️",
      targetCareer: typeof data.targetCareer === "string" ? data.targetCareer : "software_developer",
      knowledgeLevel: typeof data.knowledgeLevel === "string" ? data.knowledgeLevel : "beginner",
      level: level,
      xp: xp,
      streak: streak,
      lastActiveDate: typeof data.lastActiveDate === "string" && !isNaN(new Date(data.lastActiveDate).getTime()) ? data.lastActiveDate : new Date().toDateString(),
      unlockedNodes: unlockedNodes,
      completedVibeProjects: completedVibeProjects,
      completedMissions: completedMissions,
      exploredTools: exploredTools,
      joinedGroups: joinedGroups,
      tasks: tasks,
      subjects: subjects,
      studySessions: studySessions,
      theme: data.theme === "light" ? "light" : "dark"
    }
  };
}

// --- LOCAL STORAGE SYNC ---
function saveProfile() {
  localStorage.setItem("rpg_student_profile", JSON.stringify(state));
  updateHUD();
}

function loadProfile() {
  const saved = localStorage.getItem("rpg_student_profile");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      const validation = validateProfileSchema(parsed);
      if (validation.valid) {
        state = validation.sanitized;
      }
    } catch (e) {
      console.warn("Failed to parse saved profile, using defaults:", e);
    }
    
    // Check if new day to reset streak and missions using calendar day difference
    const today = new Date().toDateString();
    if (state.lastActiveDate !== today) {
      const diffDays = getCalendarDayDiff(today, state.lastActiveDate);
      
      if (diffDays === 1) {
        state.streak += 1;
      } else if (diffDays > 1) {
        state.streak = 1;
      }
      
      state.lastActiveDate = today;
      state.completedMissions = []; // Reset daily missions
      saveProfile();
    }
  } else {
    // No saved profile — show onboarding modal
    document.getElementById("onboardingModal").classList.add("active");
  }

  // Ensure tasks array is initialized; seed if empty
  if (!state.tasks || state.tasks.length === 0) {
    const todayDate = new Date();
    const inTwoDays = new Date(todayDate);
    inTwoDays.setDate(todayDate.getDate() + 2);
    const inFourDays = new Date(todayDate);
    inFourDays.setDate(todayDate.getDate() + 4);
    const inSixDays = new Date(todayDate);
    inSixDays.setDate(todayDate.getDate() + 6);

    state.tasks = [
      {
        id: "task_seed_1",
        title: "Implement Dijkstra's Shortest Path Algorithm",
        subject: "Algorithms",
        priority: "high",
        dueDate: inTwoDays.toISOString().split("T")[0],
        completed: false,
        notes: "Review priority queue optimization and verify test graph test cases.",
        createdAt: new Date().toISOString(),
        completedAt: null
      },
      {
        id: "task_seed_2",
        title: "Operating Systems CPU Scheduling Lab Assignment",
        subject: "Operating Systems",
        priority: "medium",
        dueDate: inFourDays.toISOString().split("T")[0],
        completed: false,
        notes: "Implement Round Robin and Priority scheduling simulator in C/C++.",
        createdAt: new Date().toISOString(),
        completedAt: null
      },
      {
        id: "task_seed_3",
        title: "Read Computer Networks Chapter 4: Transport Layer Protocols",
        subject: "Computer Networks",
        priority: "low",
        dueDate: inSixDays.toISOString().split("T")[0],
        completed: true,
        notes: "TCP vs UDP handshakes and congestion control mechanisms.",
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString()
      }
    ];
    saveProfile();
  }

  // Ensure subjects array is initialized; seed if empty
  if (!state.subjects || state.subjects.length === 0) {
    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 24);
    const examDate1 = nextMonth.toISOString().split("T")[0];

    const nextMonth2 = new Date();
    nextMonth2.setDate(nextMonth2.getDate() + 32);
    const examDate2 = nextMonth2.toISOString().split("T")[0];

    state.subjects = [
      {
        id: "subj_seed_1",
        name: "Algorithms & Data Structures",
        code: "CS201",
        color: "cyan",
        examDate: examDate1,
        notes: "Core syllabus for technical coding interviews and university midterms. Focus on Big-O analysis and Dynamic Programming.",
        topics: [
          { id: "tp_1", title: "Asymptotic Notation & Time Complexity", completed: true, estimatedHours: 3, completedAt: new Date().toISOString() },
          { id: "tp_2", title: "Trees, Heaps & Priority Queues", completed: true, estimatedHours: 4, completedAt: new Date().toISOString() },
          { id: "tp_3", title: "Graph Algorithms: BFS, DFS & Dijkstra", completed: false, estimatedHours: 5, completedAt: null },
          { id: "tp_4", title: "Dynamic Programming Memoization & Tabulation", completed: false, estimatedHours: 6, completedAt: null }
        ],
        createdAt: new Date().toISOString()
      },
      {
        id: "subj_seed_2",
        name: "Operating Systems",
        code: "CS302",
        color: "purple",
        examDate: examDate2,
        notes: "Process management, memory virtualization, virtual memory paging, and concurrency deadlocks.",
        topics: [
          { id: "tp_5", title: "Processes, Threads & Context Switching", completed: true, estimatedHours: 3, completedAt: new Date().toISOString() },
          { id: "tp_6", title: "CPU Scheduling Algorithms (FCFS, SJF, RR)", completed: false, estimatedHours: 4, completedAt: null },
          { id: "tp_7", title: "Deadlock Detection & Banker's Algorithm", completed: false, estimatedHours: 3, completedAt: null }
        ],
        createdAt: new Date().toISOString()
      },
      {
        id: "subj_seed_3",
        name: "Computer Networks",
        code: "CS401",
        color: "emerald",
        examDate: "",
        notes: "OSI and TCP/IP stack layers, routing protocols, and HTTP/3 transport primitives.",
        topics: [
          { id: "tp_8", title: "Application Layer: HTTP, DNS & WebSockets", completed: true, estimatedHours: 3, completedAt: new Date().toISOString() },
          { id: "tp_9", title: "Transport Layer: TCP Reliability & Flow Control", completed: false, estimatedHours: 4, completedAt: null }
        ],
        createdAt: new Date().toISOString()
      }
    ];
    saveProfile();
  }

  // Ensure studySessions array is initialized; seed if empty
  if (!state.studySessions || state.studySessions.length === 0) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    state.studySessions = [
      {
        id: "session_seed_1",
        subject: "Algorithms & Data Structures",
        durationMinutes: 50,
        date: yesterday.toISOString().split("T")[0],
        completedAt: yesterday.toISOString()
      },
      {
        id: "session_seed_2",
        subject: "Operating Systems",
        durationMinutes: 45,
        date: twoDaysAgo.toISOString().split("T")[0],
        completedAt: twoDaysAgo.toISOString()
      }
    ];
    saveProfile();
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
    
    // Re-render radar chart if visible so theme colors update immediately
    const dashView = document.getElementById("dashboardView");
    if (dashView && dashView.classList.contains("active")) {
      renderRadarChart();
    }
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
    const rawName = usernameInput.value.trim() || "Scholar";
    state.username = rawName.slice(0, 30);
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
    
    // Add welcome AI Mentor message with safe escaping
    const safeName = escapeHTML(state.username);
    const careerObj = CAREER_DATA[state.targetCareer];
    const careerTitle = escapeHTML(careerObj ? careerObj.title : "Developer");
    const welcome = `**AI Mentor:**<br><br>Welcome to your learning chamber, <strong>${safeName}</strong>! I have calibrated your study goals to target the <strong>${careerTitle}</strong> path.<br><br>Type <em>"recommend"</em> in the chat or navigate to the <strong>Skill Tree</strong> to begin!`;
    const mentorBox = document.getElementById("mentorChatMessagesBox");
    mentorBox.innerHTML = `<div class="chat-bubble assistant">${welcome}</div>`;
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
        requestAnimationFrame(() => {
          renderDashboard();
        });
      } else if (target === "tasks") {
        requestAnimationFrame(() => {
          renderTasks();
        });
      } else if (target === "subjects") {
        requestAnimationFrame(() => {
          renderSubjects();
        });
      } else if (target === "timer") {
        requestAnimationFrame(() => {
          renderTimerView();
        });
      } else if (target === "skilltree") {
        requestAnimationFrame(() => {
          initSkillTree();
        });
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

// --- 1. DASHBOARD VIEW CONTROLLER & REAL-DATA ANALYTICS ---

// Calculate exact recorded study time from stored session records
function getTotalRecordedStudyTime() {
  const sessions = state.studySessions || [];
  const totalMinutes = sessions.reduce((acc, s) => acc + (Number(s.durationMinutes) || 0), 0);
  if (totalMinutes === 0) return "0 mins";
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hours === 0) return `${mins} mins`;
  if (mins === 0) return `${hours} hrs`;
  return `${hours}h ${mins}m`;
}

// Wire up Dashboard event listeners
function initDashboard() {
  const quickAddBtn = document.getElementById("dashQuickAddTaskBtn");
  const viewAllBtn = document.getElementById("dashViewAllTasksBtn");
  const openTasksBtn = document.getElementById("dashOpenTasksBtn");

  const openTimerBtn = document.getElementById("dashOpenTimerBtn");
  const metricStudyTimeCard = document.getElementById("dashMetricStudyTime")?.parentElement;

  if (quickAddBtn) {
    quickAddBtn.addEventListener("click", () => openTaskModal());
  }
  if (openTimerBtn) {
    openTimerBtn.addEventListener("click", () => {
      document.querySelector('[data-target="timer"]')?.click();
    });
  }
  if (metricStudyTimeCard) {
    metricStudyTimeCard.style.cursor = "pointer";
    metricStudyTimeCard.title = "Click to open Focus & Study Timer";
    metricStudyTimeCard.addEventListener("click", () => {
      document.querySelector('[data-target="timer"]')?.click();
    });
  }
  if (viewAllBtn) {
    viewAllBtn.addEventListener("click", () => {
      document.querySelector('[data-target="tasks"]')?.click();
    });
  }
  if (openTasksBtn) {
    openTasksBtn.addEventListener("click", () => {
      document.querySelector('[data-target="tasks"]')?.click();
    });
  }
}

function renderDashboard() {
  const allTasks = state.tasks || [];
  const todayStr = new Date().toISOString().split("T")[0];

  // 1. Calculate Real Academic Metrics from Stored Task Records
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter(t => t.completed);
  const pendingTasks = allTasks.filter(t => !t.completed);
  const todayTasks = allTasks.filter(t => t.dueDate === todayStr);
  const todayPending = todayTasks.filter(t => !t.completed);
  const overdueTasks = allTasks.filter(t => !t.completed && t.dueDate < todayStr);

  const completionPct = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  const metricTodayEl = document.getElementById("dashMetricToday");
  const metricPendingEl = document.getElementById("dashMetricPending");
  const metricCompletedEl = document.getElementById("dashMetricCompleted");
  const metricOverdueEl = document.getElementById("dashMetricOverdue");
  const metricStudyTimeEl = document.getElementById("dashMetricStudyTime");

  if (metricTodayEl) {
    metricTodayEl.textContent = todayTasks.length > 0 ? `${todayPending.length} / ${todayTasks.length}` : "0";
  }
  if (metricPendingEl) metricPendingEl.textContent = pendingTasks.length;
  if (metricCompletedEl) metricCompletedEl.textContent = `${completedTasks.length} (${completionPct}%)`;
  if (metricOverdueEl) metricOverdueEl.textContent = overdueTasks.length;
  if (metricStudyTimeEl) metricStudyTimeEl.textContent = getTotalRecordedStudyTime();

  // 2. Upcoming Deadlines & Priorities (Real Stored Tasks)
  const upcomingListEl = document.getElementById("dashUpcomingTasksList");
  const upcomingEmptyEl = document.getElementById("dashUpcomingEmptyState");
  const overdueAlertBanner = document.getElementById("dashOverdueAlertBanner");
  const overdueAlertText = document.getElementById("dashOverdueAlertText");

  // Show/hide overdue alert banner
  if (overdueAlertBanner && overdueAlertText) {
    if (overdueTasks.length > 0) {
      overdueAlertBanner.style.display = "flex";
      overdueAlertText.textContent = `You have ${overdueTasks.length} overdue study task${overdueTasks.length > 1 ? "s" : ""} requiring attention!`;
    } else {
      overdueAlertBanner.style.display = "none";
    }
  }

  // Calculate upcoming deadlines: overdue tasks, tasks due today, and tasks due in next 7 days
  const nextWeekDate = new Date();
  nextWeekDate.setDate(nextWeekDate.getDate() + 7);
  const nextWeekStr = nextWeekDate.toISOString().split("T")[0];

  const upcomingTasks = allTasks.filter(t => {
    if (!t.completed) {
      return t.dueDate <= nextWeekStr;
    }
    // Include tasks completed today so accomplishments remain visible
    return t.dueDate === todayStr;
  });

  const pWeights = { high: 3, medium: 2, low: 1 };
  upcomingTasks.sort((a, b) => {
    const aOverdue = !a.completed && a.dueDate < todayStr;
    const bOverdue = !b.completed && b.dueDate < todayStr;
    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;

    const dateCmp = (a.dueDate || "").localeCompare(b.dueDate || "");
    if (dateCmp !== 0) return dateCmp;

    return (pWeights[b.priority] || 0) - (pWeights[a.priority] || 0);
  });

  if (upcomingListEl) {
    upcomingListEl.innerHTML = "";
    const topUpcoming = upcomingTasks.slice(0, 5);

    if (topUpcoming.length === 0) {
      if (upcomingEmptyEl) upcomingEmptyEl.style.display = "block";
    } else {
      if (upcomingEmptyEl) upcomingEmptyEl.style.display = "none";

      topUpcoming.forEach(task => {
        const isOverdue = !task.completed && task.dueDate < todayStr;
        const isDueToday = !task.completed && task.dueDate === todayStr;

        const item = document.createElement("div");
        item.className = `dash-upcoming-item ${task.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}`;

        let dueBadgeText = task.dueDate;
        let dueBadgeClass = "";
        if (isOverdue) {
          dueBadgeText = "🚨 Overdue (" + task.dueDate + ")";
          dueBadgeClass = "overdue";
        } else if (isDueToday) {
          dueBadgeText = "⚡ Due Today";
          dueBadgeClass = "due-today";
        } else {
          dueBadgeText = "📅 " + task.dueDate;
        }

        item.innerHTML = `
          <button class="task-checkbox-btn" aria-label="${task.completed ? 'Mark task as pending' : 'Mark task as completed'}" data-action="toggle">
            ${task.completed ? '✓' : ''}
          </button>
          <div style="flex-grow:1; min-width:0;">
            <div class="dash-upcoming-title">${escapeHTML(task.title)}</div>
            <div class="task-card-meta" style="margin-top:4px;">
              <span class="task-subject-tag">${escapeHTML(task.subject || 'General Study')}</span>
              <span class="task-priority-tag priority-${escapeHTML(task.priority)}">${escapeHTML(task.priority)}</span>
              <span class="task-due-badge ${dueBadgeClass}">${escapeHTML(dueBadgeText)}</span>
            </div>
          </div>
        `;

        item.querySelector('[data-action="toggle"]').addEventListener("click", () => {
          toggleTaskStatus(task.id);
        });

        upcomingListEl.appendChild(item);
      });
    }
  }

  // 3. Subject-Wise Progress & Completion (Calculated from Real Records)
  const subjectContainer = document.getElementById("dashSubjectProgressContainer");
  const subjectEmptyEl = document.getElementById("dashSubjectEmptyState");

  if (subjectContainer) {
    subjectContainer.innerHTML = "";

    // Gather all subjects (from formal state.subjects plus any unique subjects from tasks)
    const subjectMap = {};

    (state.subjects || []).forEach(s => {
      const sName = s.name.trim();
      const totalTopics = (s.topics || []).length;
      const completedTopics = (s.topics || []).filter(tp => tp.completed).length;
      subjectMap[sName] = {
        name: sName,
        code: s.code || "",
        color: s.color || "cyan",
        examDate: s.examDate || "",
        syllabusTotal: totalTopics,
        syllabusCompleted: completedTopics,
        tasksTotal: 0,
        tasksCompleted: 0
      };
    });

    allTasks.forEach(task => {
      const subj = (task.subject || "General Study").trim();
      if (!subjectMap[subj]) {
        subjectMap[subj] = {
          name: subj,
          code: "",
          color: "cyan",
          examDate: "",
          syllabusTotal: 0,
          syllabusCompleted: 0,
          tasksTotal: 0,
          tasksCompleted: 0
        };
      }
      subjectMap[subj].tasksTotal += 1;
      if (task.completed) subjectMap[subj].tasksCompleted += 1;
    });

    const subjects = Object.values(subjectMap).sort((a, b) => a.name.localeCompare(b.name));

    if (subjects.length === 0) {
      if (subjectEmptyEl) subjectEmptyEl.style.display = "block";
    } else {
      if (subjectEmptyEl) subjectEmptyEl.style.display = "none";

      subjects.forEach(data => {
        // Calculate progress: if syllabus topics exist, use syllabus topic completion; otherwise use coursework tasks completion
        let pct = 0;
        let progressLabel = "";

        if (data.syllabusTotal > 0) {
          pct = Math.round((data.syllabusCompleted / data.syllabusTotal) * 100);
          progressLabel = `${data.syllabusCompleted} / ${data.syllabusTotal} syllabus topics (${pct}%)`;
        } else if (data.tasksTotal > 0) {
          pct = Math.round((data.tasksCompleted / data.tasksTotal) * 100);
          progressLabel = `${data.tasksCompleted} / ${data.tasksTotal} tasks (${pct}%)`;
        } else {
          progressLabel = `0 topics (${pct}%)`;
        }

        let examBadgeHtml = "";
        if (data.examDate) {
          const daysToExam = Math.ceil((new Date(data.examDate + "T00:00:00") - new Date()) / (1000 * 60 * 60 * 24));
          const examText = daysToExam > 0 ? `Exam in ${daysToExam}d` : (daysToExam === 0 ? "Exam Today!" : "Exam Passed");
          const isImminent = daysToExam >= 0 && daysToExam <= 7;
          examBadgeHtml = `<span class="subject-exam-badge ${isImminent ? 'imminent' : ''}" style="font-size:10px; padding:1px 6px;">🎯 ${escapeHTML(examText)}</span>`;
        }

        const row = document.createElement("div");
        row.className = "dash-subject-row";
        row.innerHTML = `
          <div class="dash-subject-row-header">
            <div style="display:flex; align-items:center; gap:8px;">
              <span>📚 ${escapeHTML(data.name)}</span>
              ${data.code ? `<span class="subject-code-tag" style="font-size:10px; padding:1px 5px;">${escapeHTML(data.code)}</span>` : ""}
              ${examBadgeHtml}
            </div>
            <span style="color:var(--text-muted); font-size:12px;">
              <strong style="color:var(--color-primary);">${progressLabel}</strong>
            </span>
          </div>
          <div class="dash-subject-progress-track" title="${pct}% Completed">
            <div class="dash-subject-progress-fill" style="width:${pct}%;"></div>
          </div>
        `;
        subjectContainer.appendChild(row);
      });
    }
  }

  // 4. Top Study Priority Summary Box
  const topPriorityBox = document.getElementById("dashTopPriorityBox");
  if (topPriorityBox) {
    if (overdueTasks.length > 0) {
      const firstOverdue = [...overdueTasks].sort((a, b) => (pWeights[b.priority] || 0) - (pWeights[a.priority] || 0))[0];
      topPriorityBox.innerHTML = `
        <div style="color:var(--color-danger); font-weight:700; margin-bottom:4px; font-size:13px;">🚨 Critical Attention Required</div>
        <div style="font-weight:600; color:var(--text-main);">${escapeHTML(firstOverdue.title)}</div>
        <div style="font-size:12px; color:var(--text-muted); margin-top:4px;">
          Subject: <span style="color:var(--color-primary);">${escapeHTML(firstOverdue.subject)}</span> · Due Date: <span style="color:var(--color-danger);">${escapeHTML(firstOverdue.dueDate)}</span>
        </div>
      `;
    } else if (todayPending.length > 0) {
      const firstToday = [...todayPending].sort((a, b) => (pWeights[b.priority] || 0) - (pWeights[a.priority] || 0))[0];
      topPriorityBox.innerHTML = `
        <div style="color:var(--color-accent); font-weight:700; margin-bottom:4px; font-size:13px;">⚡ Top Priority For Today</div>
        <div style="font-weight:600; color:var(--text-main);">${escapeHTML(firstToday.title)}</div>
        <div style="font-size:12px; color:var(--text-muted); margin-top:4px;">
          Subject: <span style="color:var(--color-primary);">${escapeHTML(firstToday.subject)}</span> · Priority: <span class="task-priority-tag priority-${escapeHTML(firstToday.priority)}">${escapeHTML(firstToday.priority)}</span>
        </div>
      `;
    } else if (pendingTasks.length > 0) {
      const nextTask = [...pendingTasks].sort((a, b) => (a.dueDate || "").localeCompare(b.dueDate || ""))[0];
      topPriorityBox.innerHTML = `
        <div style="color:var(--color-primary); font-weight:700; margin-bottom:4px; font-size:13px;">📅 Next Scheduled Milestone</div>
        <div style="font-weight:600; color:var(--text-main);">${escapeHTML(nextTask.title)}</div>
        <div style="font-size:12px; color:var(--text-muted); margin-top:4px;">
          Subject: <span style="color:var(--color-primary);">${escapeHTML(nextTask.subject)}</span> · Due: ${escapeHTML(nextTask.dueDate)}
        </div>
      `;
    } else if (totalTasks > 0) {
      topPriorityBox.innerHTML = `
        <div style="color:var(--color-success); font-weight:700; margin-bottom:4px; font-size:13px;">🎉 All Study Deliverables Clear!</div>
        <div style="font-size:13px; color:var(--text-muted);">You have completed 100% of your recorded coursework tasks. Add new goals to keep advancing.</div>
      `;
    } else {
      topPriorityBox.innerHTML = `
        <div style="color:var(--text-muted); font-size:13px;">No tasks created yet. Click "Quick Add Task" to set up your coursework deliverables.</div>
      `;
    }
  }

  // 5. RPG Character Progression Metrics
  const statNodesEl = document.getElementById("statNodesUnlocked");
  if (statNodesEl) statNodesEl.innerText = state.unlockedNodes.length;

  const statVibeEl = document.getElementById("statVibeProjects");
  if (statVibeEl) statVibeEl.innerText = state.completedVibeProjects || 0;

  let accumulated = state.xp;
  for (let i = 1; i < state.level; i++) {
    accumulated += getXPNeededForLevel(i);
  }
  const statTotalXpEl = document.getElementById("statTotalXp");
  if (statTotalXpEl) statTotalXpEl.innerText = accumulated;

  // 6. Dynamic AI Mentor Suggestion
  const rec = AI_ENGINE.getRecommendation(state);
  const recBox = document.getElementById("dashMentorRecBox");
  if (recBox) {
    recBox.innerHTML = `<p>${rec.reason}</p><p style="margin-top: 8px; color: var(--text-muted); font-style: italic;">💡 ${rec.advice}</p>`;
  }

  const gotoBtn = document.getElementById("dashGotoSkillBtn");
  if (gotoBtn) {
    if (rec.skillId) {
      gotoBtn.innerText = `Unlock ${rec.name}`;
      gotoBtn.disabled = false;
      gotoBtn.onclick = () => {
        document.querySelector('[data-target="skilltree"]').click();
        setTimeout(() => {
          const nodeEl = document.querySelector(`[data-id="${rec.skillId}"]`);
          if (nodeEl) nodeEl.click();
        }, 300);
      };
    } else {
      gotoBtn.innerText = "All Skills Complete!";
      gotoBtn.disabled = true;
    }
  }

  // 7. Distinct Daily RPG Missions (Kept strictly separated from academic tasks)
  renderDailyMissions();

  // 8. Learning Analytics Radar Chart
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
  // Guard against attempting to render on a hidden or detached canvas
  if (!ctx.offsetParent) return;
  
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
    skillsChart = null;
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

// Keep dynamic views in sync upon window resize
let appResizeDebounce = null;
window.addEventListener("resize", () => {
  clearTimeout(appResizeDebounce);
  appResizeDebounce = setTimeout(() => {
    const treeView = document.getElementById("skilltreeView");
    if (treeView && treeView.classList.contains("active")) {
      initSkillTree();
    }
    const dashView = document.getElementById("dashboardView");
    if (dashView && dashView.classList.contains("active")) {
      renderRadarChart();
    }
  }, 120);
});

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
  
  // Node circle is 54px by 54px; center offset is 27px
  const nodeCenterOffset = 27;
  
  for (let key in SKILLS_DATA) {
    const node = SKILLS_DATA[key];
    const prereqs = node.prerequisites || [];
    
    prereqs.forEach(prKey => {
      const prNode = SKILLS_DATA[prKey];
      if (prNode) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", prNode.x + nodeCenterOffset);
        line.setAttribute("y1", prNode.y + nodeCenterOffset);
        line.setAttribute("x2", node.x + nodeCenterOffset);
        line.setAttribute("y2", node.y + nodeCenterOffset);
        
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
    
    // Append user message with safe escaping
    const safeUser = escapeHTML(state.username);
    const safeText = escapeHTML(text);
    const userBubble = document.createElement("div");
    userBubble.className = "chat-bubble user";
    userBubble.innerHTML = `<strong>${safeUser}:</strong><br>${safeText}`;
    msgBox.appendChild(userBubble);
    
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
      
      const assistantBubble = document.createElement("div");
      assistantBubble.className = "chat-bubble assistant";
      // Format markdown safely: sanitize raw text then convert bold, italic, code, line breaks
      const safeFormatted = escapeHTML(response)
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>');
      assistantBubble.innerHTML = safeFormatted;
      msgBox.appendChild(assistantBubble);
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
            <div style="font-weight:700;">${escapeHTML(item.name)}</div>
            <div style="font-size:10px; color:var(--text-muted);">${escapeHTML(item.title)}</div>
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
      const textVal = importArea.value.trim();
      if (!textVal) {
        alert("Please paste your JSON profile data into the box before confirming.");
        return;
      }
      const data = JSON.parse(textVal);
      const validation = validateProfileSchema(data);
      if (validation.valid) {
        state = validation.sanitized;
        saveProfile();
        
        // Reload page
        alert("Success! Synchronization completed. Reloading simulator dashboard...");
        window.location.reload();
      } else {
        alert("Validation Error: " + validation.error);
      }
    } catch (e) {
      alert("Syntax Error! Parsing failed. Verify copied text format is valid JSON.");
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

// --- 10. STUDY TASK MANAGER CONTROLLER ---
let taskToDeleteId = null;

function initTaskManager() {
  const openModalBtn = document.getElementById("btnOpenCreateTaskModal");
  const emptyStateAddBtn = document.getElementById("emptyStateAddBtn");
  const modalCloseBtn = document.getElementById("taskModalCloseBtn");
  const modalCancelBtn = document.getElementById("taskModalCancelBtn");
  const modalSaveBtn = document.getElementById("taskModalSaveBtn");
  
  const searchInput = document.getElementById("taskSearchInput");
  const subjectFilter = document.getElementById("taskSubjectFilter");
  const priorityFilter = document.getElementById("taskPriorityFilter");
  const statusFilter = document.getElementById("taskStatusFilter");
  const sortFilter = document.getElementById("taskSortFilter");

  const deleteCancelBtn = document.getElementById("taskCancelDeleteBtn");
  const deleteConfirmBtn = document.getElementById("taskConfirmDeleteBtn");

  if (openModalBtn) openModalBtn.addEventListener("click", () => openTaskModal());
  if (emptyStateAddBtn) emptyStateAddBtn.addEventListener("click", () => openTaskModal());
  if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeTaskModal);
  if (modalCancelBtn) modalCancelBtn.addEventListener("click", closeTaskModal);
  if (modalSaveBtn) modalSaveBtn.addEventListener("click", handleSaveTask);

  if (searchInput) searchInput.addEventListener("input", renderTasks);
  if (subjectFilter) subjectFilter.addEventListener("change", renderTasks);
  if (priorityFilter) priorityFilter.addEventListener("change", renderTasks);
  if (statusFilter) statusFilter.addEventListener("change", renderTasks);
  if (sortFilter) sortFilter.addEventListener("change", renderTasks);

  if (deleteCancelBtn) deleteCancelBtn.addEventListener("click", closeDeleteModal);
  if (deleteConfirmBtn) deleteConfirmBtn.addEventListener("click", handleConfirmDelete);

  // Initial render
  renderTasks();
}

function openTaskModal(task = null) {
  const modal = document.getElementById("taskModal");
  const titleHeader = document.getElementById("taskModalTitle");
  const idInput = document.getElementById("taskModalId");
  const titleInput = document.getElementById("taskInputTitle");
  const subjectInput = document.getElementById("taskInputSubject");
  const priorityInput = document.getElementById("taskInputPriority");
  const dueDateInput = document.getElementById("taskInputDueDate");
  const notesInput = document.getElementById("taskInputNotes");

  document.getElementById("taskTitleError").style.display = "none";
  document.getElementById("taskDueDateError").style.display = "none";

  if (task) {
    titleHeader.textContent = "Edit Study Task";
    idInput.value = task.id;
    titleInput.value = task.title;
    subjectInput.value = task.subject;
    priorityInput.value = task.priority;
    dueDateInput.value = task.dueDate;
    notesInput.value = task.notes || "";
  } else {
    titleHeader.textContent = "Add Study Task";
    idInput.value = "";
    titleInput.value = "";
    subjectInput.value = "";
    priorityInput.value = "medium";
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dueDateInput.value = tomorrow.toISOString().split("T")[0];
    notesInput.value = "";
  }

  modal.classList.add("active");
  titleInput.focus();
}

function closeTaskModal() {
  document.getElementById("taskModal").classList.remove("active");
}

function handleSaveTask() {
  const id = document.getElementById("taskModalId").value.trim();
  const title = document.getElementById("taskInputTitle").value.trim();
  const subject = document.getElementById("taskInputSubject").value.trim() || "General Study";
  const priority = document.getElementById("taskInputPriority").value;
  const dueDate = document.getElementById("taskInputDueDate").value;
  const notes = document.getElementById("taskInputNotes").value.trim();

  let hasError = false;
  if (!title) {
    document.getElementById("taskTitleError").style.display = "block";
    hasError = true;
  } else {
    document.getElementById("taskTitleError").style.display = "none";
  }

  if (!dueDate) {
    document.getElementById("taskDueDateError").style.display = "block";
    hasError = true;
  } else {
    document.getElementById("taskDueDateError").style.display = "none";
  }

  if (hasError) return;

  if (id) {
    const task = (state.tasks || []).find(t => t.id === id);
    if (task) {
      task.title = title.slice(0, 100);
      task.subject = subject.slice(0, 50);
      task.priority = priority;
      task.dueDate = dueDate;
      task.notes = notes.slice(0, 500);
      saveProfile();
      alert("Study task updated successfully!");
    }
  } else {
    const newTask = {
      id: "task_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
      title: title.slice(0, 100),
      subject: subject.slice(0, 50),
      priority: priority,
      dueDate: dueDate,
      completed: false,
      notes: notes.slice(0, 500),
      createdAt: new Date().toISOString(),
      completedAt: null
    };
    if (!state.tasks) state.tasks = [];
    state.tasks.unshift(newTask);
    saveProfile();
    alert("Study task created successfully!");
  }

  closeTaskModal();
  renderTasks();
  renderDashboard();
}

function openDeleteModal(taskId) {
  const task = (state.tasks || []).find(t => t.id === taskId);
  if (!task) return;
  taskToDeleteId = taskId;
  document.getElementById("taskDeleteTitlePreview").textContent = task.title;
  document.getElementById("taskDeleteModal").classList.add("active");
}

function closeDeleteModal() {
  taskToDeleteId = null;
  document.getElementById("taskDeleteModal").classList.remove("active");
}

function handleConfirmDelete() {
  if (!taskToDeleteId) return;
  state.tasks = (state.tasks || []).filter(t => t.id !== taskToDeleteId);
  saveProfile();
  closeDeleteModal();
  renderTasks();
  renderDashboard();
  alert("Task deleted successfully.");
}

function toggleTaskStatus(taskId) {
  const task = (state.tasks || []).find(t => t.id === taskId);
  if (!task) return;

  task.completed = !task.completed;
  if (task.completed) {
    task.completedAt = new Date().toISOString();
    grantXP(20);
  } else {
    task.completedAt = null;
  }

  saveProfile();
  updateHUD();
  renderTasks();
  renderDashboard();
}

function renderTasks() {
  const listContainer = document.getElementById("tasksListContainer");
  const emptyState = document.getElementById("tasksEmptyState");
  if (!listContainer) return;

  const searchVal = (document.getElementById("taskSearchInput")?.value || "").toLowerCase().trim();
  const subjectVal = document.getElementById("taskSubjectFilter")?.value || "all";
  const priorityVal = document.getElementById("taskPriorityFilter")?.value || "all";
  const statusVal = document.getElementById("taskStatusFilter")?.value || "all";
  const sortVal = document.getElementById("taskSortFilter")?.value || "dueDateAsc";

  // Dynamic Subject filter population
  const subjectFilterEl = document.getElementById("taskSubjectFilter");
  if (subjectFilterEl) {
    const currentSelected = subjectFilterEl.value;
    const subjectsSet = new Set();
    (state.subjects || []).forEach(s => { if (s.name) subjectsSet.add(s.name); });
    (state.tasks || []).forEach(t => { if (t.subject) subjectsSet.add(t.subject); });
    
    subjectFilterEl.innerHTML = '<option value="all">All Subjects</option>';
    Array.from(subjectsSet).sort().forEach(subj => {
      const opt = document.createElement("option");
      opt.value = subj;
      opt.textContent = subj;
      if (subj === currentSelected) opt.selected = true;
      subjectFilterEl.appendChild(opt);
    });
  }

  const todayStr = new Date().toISOString().split("T")[0];

  let filtered = (state.tasks || []).filter(task => {
    if (searchVal) {
      const matchesTitle = (task.title || "").toLowerCase().includes(searchVal);
      const matchesNotes = (task.notes || "").toLowerCase().includes(searchVal);
      const matchesSubject = (task.subject || "").toLowerCase().includes(searchVal);
      if (!matchesTitle && !matchesNotes && !matchesSubject) return false;
    }
    if (subjectVal !== "all" && task.subject !== subjectVal) return false;
    if (priorityVal !== "all" && task.priority !== priorityVal) return false;
    if (statusVal === "completed" && !task.completed) return false;
    if (statusVal === "pending" && task.completed) return false;
    if (statusVal === "overdue" && (task.completed || task.dueDate >= todayStr)) return false;

    return true;
  });

  filtered.sort((a, b) => {
    if (sortVal === "dueDateAsc") {
      return (a.dueDate || "").localeCompare(b.dueDate || "");
    } else if (sortVal === "dueDateDesc") {
      return (b.dueDate || "").localeCompare(a.dueDate || "");
    } else if (sortVal === "priorityDesc") {
      const pWeights = { high: 3, medium: 2, low: 1 };
      return (pWeights[b.priority] || 0) - (pWeights[a.priority] || 0);
    } else if (sortVal === "newest") {
      return (b.createdAt || "").localeCompare(a.createdAt || "");
    }
    return 0;
  });

  const allTasks = state.tasks || [];
  const totalCount = allTasks.length;
  const completedCount = allTasks.filter(t => t.completed).length;
  const pendingCount = allTasks.filter(t => !t.completed).length;
  const overdueCount = allTasks.filter(t => !t.completed && t.dueDate < todayStr).length;

  const totalEl = document.getElementById("taskMetricTotal");
  const pendingEl = document.getElementById("taskMetricPending");
  const completedEl = document.getElementById("taskMetricCompleted");
  const overdueEl = document.getElementById("taskMetricOverdue");

  if (totalEl) totalEl.textContent = totalCount;
  if (pendingEl) pendingEl.textContent = pendingCount;
  if (completedEl) completedEl.textContent = completedCount;
  if (overdueEl) overdueEl.textContent = overdueCount;

  listContainer.innerHTML = "";

  if (filtered.length === 0) {
    if (emptyState) emptyState.style.display = "block";
  } else {
    if (emptyState) emptyState.style.display = "none";

    filtered.forEach(task => {
      const isOverdue = !task.completed && task.dueDate < todayStr;
      const isDueToday = !task.completed && task.dueDate === todayStr;

      const card = document.createElement("div");
      card.className = `card-glass task-card ${task.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}`;
      
      let dueBadgeText = task.dueDate;
      let dueBadgeClass = "";
      if (isOverdue) {
        dueBadgeText = "🚨 Overdue (" + task.dueDate + ")";
        dueBadgeClass = "overdue";
      } else if (isDueToday) {
        dueBadgeText = "⚡ Due Today";
        dueBadgeClass = "due-today";
      } else {
        dueBadgeText = "📅 Due: " + task.dueDate;
      }

      card.innerHTML = `
        <button class="task-checkbox-btn" aria-label="${task.completed ? 'Mark task as pending' : 'Mark task as completed'}" data-action="toggle">
          ${task.completed ? '✓' : ''}
        </button>
        <div class="task-card-body">
          <div class="task-card-title">${escapeHTML(task.title)}</div>
          <div class="task-card-meta">
            <span class="task-subject-tag">${escapeHTML(task.subject || 'General Study')}</span>
            <span class="task-priority-tag priority-${escapeHTML(task.priority)}">${escapeHTML(task.priority)}</span>
            <span class="task-due-badge ${dueBadgeClass}">${escapeHTML(dueBadgeText)}</span>
          </div>
          ${task.notes ? `<div class="task-notes-preview">${escapeHTML(task.notes)}</div>` : ''}
        </div>
        <div class="task-card-actions">
          <button class="task-action-btn timer-btn" title="Start Focus Timer for this Task" aria-label="Start Focus Timer" data-action="timer">⏱️</button>
          <button class="task-action-btn edit-btn" title="Edit Task" aria-label="Edit Task" data-action="edit">✏️</button>
          <button class="task-action-btn delete-btn" title="Delete Task" aria-label="Delete Task" data-action="delete">🗑️</button>
        </div>
      `;

      card.querySelector('[data-action="toggle"]').addEventListener("click", () => toggleTaskStatus(task.id));
      card.querySelector('[data-action="timer"]').addEventListener("click", () => startTimerForTask(task));
      card.querySelector('[data-action="edit"]').addEventListener("click", () => openTaskModal(task));
      card.querySelector('[data-action="delete"]').addEventListener("click", () => openDeleteModal(task.id));

      listContainer.appendChild(card);
    });
  }
}

// --- 11. SUBJECTS & SYLLABUS CONTROLLER & TRACKER ---
let subjectToDeleteId = null;

function initSubjectsManager() {
  const openCreateSubjectBtn = document.getElementById("btnOpenCreateSubjectModal");
  const emptyStateAddSubjectBtn = document.getElementById("emptyStateAddSubjectBtn");
  const subjectModalCloseBtn = document.getElementById("subjectModalCloseBtn");
  const subjectCancelBtn = document.getElementById("subjectCancelBtn");
  const subjectSaveBtn = document.getElementById("subjectSaveBtn");

  const topicModalCloseBtn = document.getElementById("topicModalCloseBtn");
  const topicCancelBtn = document.getElementById("topicCancelBtn");
  const topicSaveBtn = document.getElementById("topicSaveBtn");

  const subjectCancelDeleteBtn = document.getElementById("subjectCancelDeleteBtn");
  const subjectConfirmDeleteBtn = document.getElementById("subjectConfirmDeleteBtn");

  if (openCreateSubjectBtn) openCreateSubjectBtn.addEventListener("click", () => openSubjectModal(null));
  if (emptyStateAddSubjectBtn) emptyStateAddSubjectBtn.addEventListener("click", () => openSubjectModal(null));
  if (subjectModalCloseBtn) subjectModalCloseBtn.addEventListener("click", closeSubjectModal);
  if (subjectCancelBtn) subjectCancelBtn.addEventListener("click", closeSubjectModal);
  if (subjectSaveBtn) subjectSaveBtn.addEventListener("click", handleSaveSubject);

  if (topicModalCloseBtn) topicModalCloseBtn.addEventListener("click", closeTopicModal);
  if (topicCancelBtn) topicCancelBtn.addEventListener("click", closeTopicModal);
  if (topicSaveBtn) topicSaveBtn.addEventListener("click", handleSaveTopic);

  if (subjectCancelDeleteBtn) subjectCancelDeleteBtn.addEventListener("click", closeSubjectDeleteModal);
  if (subjectConfirmDeleteBtn) subjectConfirmDeleteBtn.addEventListener("click", handleConfirmDeleteSubject);

  // Close modals on escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeSubjectModal();
      closeTopicModal();
      closeSubjectDeleteModal();
    }
  });
}

function openSubjectModal(subject = null) {
  const modal = document.getElementById("subjectModal");
  const titleEl = document.getElementById("subjectModalTitle");
  const idInput = document.getElementById("subjectModalId");
  const nameInput = document.getElementById("subjectNameInput");
  const codeInput = document.getElementById("subjectCodeInput");
  const colorInput = document.getElementById("subjectColorInput");
  const examDateInput = document.getElementById("subjectExamDateInput");
  const notesInput = document.getElementById("subjectNotesInput");

  if (!modal) return;

  if (subject) {
    titleEl.textContent = "Edit Subject";
    idInput.value = subject.id;
    nameInput.value = subject.name || "";
    codeInput.value = subject.code || "";
    colorInput.value = subject.color || "cyan";
    examDateInput.value = subject.examDate || "";
    notesInput.value = subject.notes || "";
  } else {
    titleEl.textContent = "Add Subject";
    idInput.value = "";
    nameInput.value = "";
    codeInput.value = "";
    colorInput.value = "cyan";
    examDateInput.value = "";
    notesInput.value = "";
  }

  modal.classList.add("active");
  nameInput.focus();
}

function closeSubjectModal() {
  const modal = document.getElementById("subjectModal");
  if (modal) modal.classList.remove("active");
}

function handleSaveSubject() {
  const id = document.getElementById("subjectModalId").value.trim();
  const name = document.getElementById("subjectNameInput").value.trim();
  const code = document.getElementById("subjectCodeInput").value.trim();
  const color = document.getElementById("subjectColorInput").value;
  const examDate = document.getElementById("subjectExamDateInput").value;
  const notes = document.getElementById("subjectNotesInput").value.trim();

  if (!name) {
    alert("Please provide a subject title.");
    document.getElementById("subjectNameInput").focus();
    return;
  }

  if (id) {
    const subject = (state.subjects || []).find(s => s.id === id);
    if (subject) {
      subject.name = name.slice(0, 60);
      subject.code = code.slice(0, 20);
      subject.color = color;
      subject.examDate = examDate;
      subject.notes = notes.slice(0, 500);
      saveProfile();
      alert("Subject updated successfully!");
    }
  } else {
    const newSubject = {
      id: "subj_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
      name: name.slice(0, 60),
      code: code.slice(0, 20),
      color: color,
      examDate: examDate,
      notes: notes.slice(0, 500),
      topics: [],
      createdAt: new Date().toISOString()
    };
    if (!state.subjects) state.subjects = [];
    state.subjects.push(newSubject);
    saveProfile();
    alert("Subject created successfully!");
  }

  closeSubjectModal();
  renderSubjects();
  renderDashboard();
  renderTasks(); // Updates subject filter options
}

function openSubjectDeleteModal(subjectId) {
  const subject = (state.subjects || []).find(s => s.id === subjectId);
  if (!subject) return;
  subjectToDeleteId = subjectId;
  const preview = document.getElementById("subjectDeleteTitlePreview");
  if (preview) preview.textContent = `${subject.name} (${(subject.topics || []).length} syllabus topics)`;
  const modal = document.getElementById("subjectDeleteModal");
  if (modal) modal.classList.add("active");
}

function closeSubjectDeleteModal() {
  subjectToDeleteId = null;
  const modal = document.getElementById("subjectDeleteModal");
  if (modal) modal.classList.remove("active");
}

function handleConfirmDeleteSubject() {
  if (!subjectToDeleteId) return;
  state.subjects = (state.subjects || []).filter(s => s.id !== subjectToDeleteId);
  saveProfile();
  closeSubjectDeleteModal();
  renderSubjects();
  renderDashboard();
  renderTasks();
  alert("Subject removed successfully.");
}

// Syllabus Topics Sub-Operations
function openTopicModal(subjectId, topic = null) {
  const subject = (state.subjects || []).find(s => s.id === subjectId);
  if (!subject) return;

  const modal = document.getElementById("topicModal");
  const titleEl = document.getElementById("topicModalTitle");
  const subjIdInput = document.getElementById("topicModalSubjectId");
  const topicIdInput = document.getElementById("topicModalTopicId");
  const topicTitleInput = document.getElementById("topicTitleInput");
  const hoursInput = document.getElementById("topicEstimatedHoursInput");

  if (!modal) return;

  subjIdInput.value = subjectId;

  if (topic) {
    titleEl.textContent = `Edit Topic — ${subject.name}`;
    topicIdInput.value = topic.id;
    topicTitleInput.value = topic.title || "";
    hoursInput.value = topic.estimatedHours || 2;
  } else {
    titleEl.textContent = `Add Topic — ${subject.name}`;
    topicIdInput.value = "";
    topicTitleInput.value = "";
    hoursInput.value = 2;
  }

  modal.classList.add("active");
  topicTitleInput.focus();
}

function closeTopicModal() {
  const modal = document.getElementById("topicModal");
  if (modal) modal.classList.remove("active");
}

function handleSaveTopic() {
  const subjId = document.getElementById("topicModalSubjectId").value;
  const topicId = document.getElementById("topicModalTopicId").value;
  const title = document.getElementById("topicTitleInput").value.trim();
  const hours = parseInt(document.getElementById("topicEstimatedHoursInput").value, 10) || 2;

  if (!title) {
    alert("Please enter a topic title.");
    document.getElementById("topicTitleInput").focus();
    return;
  }

  const subject = (state.subjects || []).find(s => s.id === subjId);
  if (!subject) return;

  if (!subject.topics) subject.topics = [];

  if (topicId) {
    const topic = subject.topics.find(tp => tp.id === topicId);
    if (topic) {
      topic.title = title.slice(0, 80);
      topic.estimatedHours = Math.max(1, hours);
      saveProfile();
    }
  } else {
    const newTopic = {
      id: "topic_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
      title: title.slice(0, 80),
      completed: false,
      estimatedHours: Math.max(1, hours),
      completedAt: null
    };
    subject.topics.push(newTopic);
    saveProfile();
  }

  closeTopicModal();
  renderSubjects();
  renderDashboard();
}

function toggleTopicStatus(subjectId, topicId) {
  const subject = (state.subjects || []).find(s => s.id === subjectId);
  if (!subject || !subject.topics) return;

  const topic = subject.topics.find(tp => tp.id === topicId);
  if (!topic) return;

  topic.completed = !topic.completed;
  if (topic.completed) {
    topic.completedAt = new Date().toISOString();
    grantXP(25); // Bonus XP for mastering a syllabus topic!
  } else {
    topic.completedAt = null;
  }

  saveProfile();
  updateHUD();
  renderSubjects();
  renderDashboard();
}

function deleteTopic(subjectId, topicId) {
  const subject = (state.subjects || []).find(s => s.id === subjectId);
  if (!subject || !subject.topics) return;

  subject.topics = subject.topics.filter(tp => tp.id !== topicId);
  saveProfile();
  renderSubjects();
  renderDashboard();
}

function renderSubjects() {
  const container = document.getElementById("subjectsListContainer");
  const emptyState = document.getElementById("subjectsEmptyState");
  if (!container) return;

  const subjects = state.subjects || [];

  // Calculate Metrics
  const totalSubjects = subjects.length;
  let totalTopics = 0;
  let masteredTopics = 0;

  subjects.forEach(s => {
    (s.topics || []).forEach(tp => {
      totalTopics += 1;
      if (tp.completed) masteredTopics += 1;
    });
  });

  const pendingTopics = totalTopics - masteredTopics;
  const overallPct = totalTopics > 0 ? Math.round((masteredTopics / totalTopics) * 100) : 0;

  const elTotal = document.getElementById("subjMetricTotal");
  const elMastered = document.getElementById("subjMetricTopicsCompleted");
  const elPending = document.getElementById("subjMetricTopicsPending");
  const elOverall = document.getElementById("subjMetricOverallProgress");

  if (elTotal) elTotal.textContent = totalSubjects;
  if (elMastered) elMastered.textContent = masteredTopics;
  if (elPending) elPending.textContent = pendingTopics;
  if (elOverall) elOverall.textContent = `${overallPct}%`;

  container.innerHTML = "";

  if (subjects.length === 0) {
    if (emptyState) emptyState.style.display = "block";
  } else {
    if (emptyState) emptyState.style.display = "none";

    const accentColors = {
      cyan: "var(--color-primary)",
      purple: "var(--color-secondary)",
      amber: "var(--color-accent)",
      emerald: "var(--color-success)",
      rose: "var(--color-danger)"
    };

    subjects.forEach(subject => {
      const topics = subject.topics || [];
      const sTotalTopics = topics.length;
      const sMasteredTopics = topics.filter(t => t.completed).length;
      const sPct = sTotalTopics > 0 ? Math.round((sMasteredTopics / sTotalTopics) * 100) : 0;

      let examBadgeHtml = "";
      if (subject.examDate) {
        const daysToExam = Math.ceil((new Date(subject.examDate + "T00:00:00") - new Date()) / (1000 * 60 * 60 * 24));
        let badgeText = "";
        let badgeClass = "";
        if (daysToExam > 0) {
          badgeText = `📅 Exam in ${daysToExam} days (${subject.examDate})`;
          if (daysToExam <= 7) badgeClass = "imminent";
        } else if (daysToExam === 0) {
          badgeText = `🚨 Exam Today (${subject.examDate})`;
          badgeClass = "imminent";
        } else {
          badgeText = `Exam Passed (${subject.examDate})`;
        }
        examBadgeHtml = `<span class="subject-exam-badge ${badgeClass}">${escapeHTML(badgeText)}</span>`;
      }

      const card = document.createElement("div");
      card.className = "subject-card";
      const accentHex = accentColors[subject.color] || "var(--color-primary)";
      card.style.setProperty("--subject-accent", accentHex);

      let topicsListHtml = "";
      if (topics.length === 0) {
        topicsListHtml = `
          <div style="font-size:12px; color:var(--text-muted); font-style:italic; padding:10px; background:rgba(255,255,255,0.02); border-radius:6px; text-align:center;">
            No syllabus topics yet. Click "+ Topic" below to break down your course units.
          </div>
        `;
      } else {
        topicsListHtml = topics.map(tp => `
          <div class="subject-topic-item ${tp.completed ? 'completed' : ''}" data-topic-id="${escapeHTML(tp.id)}">
            <button class="topic-checkbox-btn" data-action="toggle-topic" aria-label="${tp.completed ? 'Mark topic as pending' : 'Mark topic as completed'}">
              ${tp.completed ? '✓' : ''}
            </button>
            <span class="subject-topic-title">${escapeHTML(tp.title)}</span>
            <span class="subject-topic-hours">${tp.estimatedHours || 2}h</span>
            <button class="subject-topic-del-btn" data-action="delete-topic" title="Delete Topic" aria-label="Delete Topic">×</button>
          </div>
        `).join("");
      }

      card.innerHTML = `
        <div class="subject-card-header">
          <div>
            <div class="subject-card-title">${escapeHTML(subject.name)}</div>
            <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
              ${subject.code ? `<span class="subject-code-tag">${escapeHTML(subject.code)}</span>` : ''}
              ${examBadgeHtml}
            </div>
          </div>
          <div style="display:flex; gap:6px;">
            <button class="task-action-btn edit-btn" title="Edit Subject" aria-label="Edit Subject" data-action="edit-subj">✏️</button>
            <button class="task-action-btn delete-btn" title="Delete Subject" aria-label="Delete Subject" data-action="delete-subj">🗑️</button>
          </div>
        </div>

        ${subject.notes ? `
          <div style="font-size:12px; color:var(--text-muted); line-height:1.4; padding:8px 10px; background:rgba(255,255,255,0.02); border-radius:6px; border-left:2px solid ${accentHex};">
            ${escapeHTML(subject.notes)}
          </div>
        ` : ''}

        <!-- Syllabus Progress Bar -->
        <div>
          <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:700; margin-bottom:6px;">
            <span style="color:var(--text-muted);">SYLLABUS PROGRESS</span>
            <span style="color:var(--color-primary);">${sMasteredTopics} / ${sTotalTopics} topics (${sPct}%)</span>
          </div>
          <div class="dash-subject-progress-track">
            <div class="dash-subject-progress-fill" style="width:${sPct}%; background:${accentHex};"></div>
          </div>
        </div>

        <!-- Topics & Units Breakdown -->
        <div class="subject-topics-section">
          <div class="subject-topics-header">
            <span>Syllabus Units & Topics (${sTotalTopics})</span>
            <button class="btn-action" style="padding:2px 8px; font-size:11px; width:auto; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1);" data-action="add-topic">
              ➕ Unit
            </button>
          </div>
          <div class="subject-topics-container" style="display:flex; flex-direction:column; gap:6px;">
            ${topicsListHtml}
          </div>
        </div>
      `;

      // Event handlers for subject actions
      card.querySelector('[data-action="edit-subj"]').addEventListener("click", () => openSubjectModal(subject));
      card.querySelector('[data-action="delete-subj"]').addEventListener("click", () => openSubjectDeleteModal(subject.id));
      card.querySelector('[data-action="add-topic"]').addEventListener("click", () => openTopicModal(subject.id));

      // Event handlers for topic toggle and delete
      card.querySelectorAll('[data-action="toggle-topic"]').forEach(btn => {
        btn.addEventListener("click", (e) => {
          const item = e.target.closest(".subject-topic-item");
          if (item) {
            const tId = item.getAttribute("data-topic-id");
            toggleTopicStatus(subject.id, tId);
          }
        });
      });

      card.querySelectorAll('[data-action="delete-topic"]').forEach(btn => {
        btn.addEventListener("click", (e) => {
          const item = e.target.closest(".subject-topic-item");
          if (item) {
            const tId = item.getAttribute("data-topic-id");
            deleteTopic(subject.id, tId);
          }
        });
      });

      container.appendChild(card);
    });
  }
}

// Level Up close overlay handler
document.getElementById("levelUpModalCloseBtn").addEventListener("click", () => {
  document.getElementById("levelUpModal").classList.remove("active");
});

// --- 12. FOCUS & STUDY TIMER CONTROLLER & REAL-TIME ENGINE ---
let timerState = {
  mode: "pomodoro", // "pomodoro" | "shortBreak" | "longBreak" | "custom" | "stopwatch"
  durationMinutes: 25,
  remainingSeconds: 25 * 60,
  elapsedStopwatchSeconds: 0,
  isRunning: false,
  intervalId: null,
  cycleCount: 1, // 1 to 4
  activeSubject: "General Study",
  activeTaskId: null,
  activeTaskTitle: "",
  activeNote: "",
  soundscape: "none",
  chimeEnabled: true,
  audioCtx: null,
  soundNodes: null,
  miniTimerDismissed: false
};

const CIRCUMFERENCE = 753.98;

// Initialize Web Audio context safely
function getAudioContext() {
  if (!timerState.audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      timerState.audioCtx = new AudioContextClass();
    }
  }
  if (timerState.audioCtx && timerState.audioCtx.state === "suspended") {
    timerState.audioCtx.resume();
  }
  return timerState.audioCtx;
}

// Synthesize pleasant bell chime with Web Audio API (zero audio file dependencies)
function playChimeSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const tones = [528, 660, 792]; // Harmonic major triad
    const now = ctx.currentTime;

    tones.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0.001, now + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.25, now + idx * 0.12 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 1.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 2.0);
    });
  } catch (err) {
    console.warn("Audio chime error:", err);
  }
}

// Synthesize ambient focus soundscape (432Hz hum, white noise, rain)
function startSoundscape(type) {
  stopSoundscape();
  if (type === "none") return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (type === "hum") {
      // 432Hz binaural meditative hum
      const osc = ctx.createOscillator();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      const mainGain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.value = 432;

      lfo.type = "sine";
      lfo.frequency.value = 0.2; // 0.2 Hz slow breathing pulse
      lfoGain.gain.value = 1.5;

      lfo.connect(osc.frequency);

      mainGain.gain.setValueAtTime(0.01, ctx.currentTime);
      mainGain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 1.5);

      osc.connect(mainGain);
      mainGain.connect(ctx.destination);

      osc.start();
      lfo.start();

      timerState.soundNodes = { osc, lfo, mainGain };
    } else if (type === "white" || type === "rain") {
      // White noise buffer
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Filter: Lowpass for rain, broader for white noise
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = type === "rain" ? 700 : 3500;

      const mainGain = ctx.createGain();
      mainGain.gain.setValueAtTime(0.005, ctx.currentTime);
      mainGain.gain.linearRampToValueAtTime(type === "rain" ? 0.05 : 0.03, ctx.currentTime + 1.5);

      whiteNoise.connect(filter);
      filter.connect(mainGain);
      mainGain.connect(ctx.destination);

      whiteNoise.start();

      timerState.soundNodes = { whiteNoise, mainGain };
    }
  } catch (err) {
    console.warn("Soundscape start error:", err);
  }
}

function stopSoundscape() {
  if (timerState.soundNodes) {
    try {
      if (timerState.soundNodes.osc) timerState.soundNodes.osc.stop();
      if (timerState.soundNodes.lfo) timerState.soundNodes.lfo.stop();
      if (timerState.soundNodes.whiteNoise) timerState.soundNodes.whiteNoise.stop();
    } catch (e) {}
    timerState.soundNodes = null;
  }
}

function initTimerManager() {
  const modeBtns = document.querySelectorAll(".timer-mode-btn");
  const playPauseBtn = document.getElementById("timerPlayPauseBtn");
  const resetBtn = document.getElementById("timerResetBtn");
  const skipBtn = document.getElementById("timerSkipBtn");
  const subjectSelect = document.getElementById("timerSubjectSelect");
  const taskSelect = document.getElementById("timerTaskSelect");
  const noteInput = document.getElementById("timerTopicNoteInput");
  const soundSelect = document.getElementById("timerSoundscapeSelect");
  const chimeToggle = document.getElementById("timerChimeToggle");
  const testChimeBtn = document.getElementById("btnTestChime");
  const customControls = document.getElementById("customDurationControls");
  const customMinsInput = document.getElementById("customMinutesInput");
  const customPresets = document.querySelectorAll(".custom-preset-btn");

  // Log session modal buttons
  const openLogSessionBtn = document.getElementById("btnOpenLogSessionModal");
  const closeLogSessionBtn = document.getElementById("logSessionCloseBtn");
  const cancelLogSessionBtn = document.getElementById("logSessionCancelBtn");
  const saveLogSessionBtn = document.getElementById("logSessionSaveBtn");
  const logDurationInput = document.getElementById("logSessionDurationInput");

  // Floating mini timer buttons
  const miniTimerArea = document.getElementById("miniTimerClickableArea");
  const miniTimerPlayPause = document.getElementById("miniTimerPlayPauseBtn");
  const miniTimerClose = document.getElementById("miniTimerCloseBtn");

  // Mode Selection
  modeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const mode = btn.getAttribute("data-mode");
      const duration = Number(btn.getAttribute("data-duration")) || 0;
      setTimerMode(mode, duration);
    });
  });

  // Custom Presets
  customPresets.forEach(preset => {
    preset.addEventListener("click", () => {
      const mins = Number(preset.getAttribute("data-mins")) || 30;
      if (customMinsInput) customMinsInput.value = mins;
      setTimerMode("custom", mins);
    });
  });

  if (customMinsInput) {
    customMinsInput.addEventListener("change", () => {
      let mins = parseInt(customMinsInput.value, 10);
      if (isNaN(mins) || mins < 1) mins = 1;
      if (mins > 180) mins = 180;
      customMinsInput.value = mins;
      if (timerState.mode === "custom") {
        setTimerMode("custom", mins);
      }
    });
  }

  // Play / Pause Toggle
  if (playPauseBtn) {
    playPauseBtn.addEventListener("click", toggleTimerPlayPause);
  }

  // Reset
  if (resetBtn) {
    resetBtn.addEventListener("click", resetTimer);
  }

  // Skip / Finish Early
  if (skipBtn) {
    skipBtn.addEventListener("click", () => {
      if (confirm("Complete current study interval and claim earned XP?")) {
        completeTimerSession();
      }
    });
  }

  // Target Subject Select
  if (subjectSelect) {
    subjectSelect.addEventListener("change", (e) => {
      timerState.activeSubject = e.target.value;
      updateActiveTargetDisplay();
    });
  }

  // Target Task Select
  if (taskSelect) {
    taskSelect.addEventListener("change", (e) => {
      const taskId = e.target.value;
      timerState.activeTaskId = taskId || null;
      if (taskId) {
        const task = (state.tasks || []).find(t => t.id === taskId);
        if (task) {
          timerState.activeTaskTitle = task.title;
          if (task.subject && task.subject !== "General Study") {
            timerState.activeSubject = task.subject;
            if (subjectSelect) subjectSelect.value = task.subject;
          }
        }
      } else {
        timerState.activeTaskTitle = "";
      }
      updateActiveTargetDisplay();
    });
  }

  // Topic Note Input
  if (noteInput) {
    noteInput.addEventListener("input", (e) => {
      timerState.activeNote = e.target.value.trim();
    });
  }

  // Soundscape selector
  if (soundSelect) {
    soundSelect.addEventListener("change", (e) => {
      timerState.soundscape = e.target.value;
      if (timerState.isRunning) {
        startSoundscape(timerState.soundscape);
      }
    });
  }

  // Chime Toggle
  if (chimeToggle) {
    chimeToggle.addEventListener("change", (e) => {
      timerState.chimeEnabled = Boolean(e.target.checked);
    });
  }

  // Test Bell
  if (testChimeBtn) {
    testChimeBtn.addEventListener("click", () => {
      playChimeSound();
    });
  }

  // Log Offline Session Modal Handlers
  if (openLogSessionBtn) {
    openLogSessionBtn.addEventListener("click", openLogSessionModal);
  }
  if (closeLogSessionBtn) closeLogSessionBtn.addEventListener("click", closeLogSessionModal);
  if (cancelLogSessionBtn) cancelLogSessionBtn.addEventListener("click", closeLogSessionModal);
  if (saveLogSessionBtn) saveLogSessionBtn.addEventListener("click", handleSaveOfflineSession);

  if (logDurationInput) {
    logDurationInput.addEventListener("input", () => {
      const mins = Math.max(1, parseInt(logDurationInput.value, 10) || 0);
      const previewEl = document.getElementById("logSessionXpPreview");
      if (previewEl) {
        previewEl.textContent = `+${mins * 2} XP`;
      }
    });
  }

  // Floating Mini-Timer Handlers
  if (miniTimerArea) {
    miniTimerArea.addEventListener("click", () => {
      document.querySelector('[data-target="timer"]')?.click();
    });
  }
  if (miniTimerPlayPause) {
    miniTimerPlayPause.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleTimerPlayPause();
    });
  }
  if (miniTimerClose) {
    miniTimerClose.addEventListener("click", (e) => {
      e.stopPropagation();
      timerState.miniTimerDismissed = true;
      document.getElementById("floatingMiniTimer").style.display = "none";
    });
  }

  // Initial populate and render
  populateTimerSelectors();
  updateTimerDisplay();
  renderTimerHistory();
}

function setTimerMode(mode, duration) {
  // Pause any active timer
  pauseTimer();

  timerState.mode = mode;
  timerState.durationMinutes = duration;
  if (mode === "stopwatch") {
    timerState.elapsedStopwatchSeconds = 0;
    timerState.remainingSeconds = 0;
  } else {
    timerState.remainingSeconds = duration * 60;
  }

  // Update tabs active styling
  document.querySelectorAll(".timer-mode-btn").forEach(btn => {
    btn.classList.toggle("active", btn.getAttribute("data-mode") === mode);
  });

  // Toggle custom duration bar
  const customControls = document.getElementById("customDurationControls");
  if (customControls) {
    customControls.style.display = mode === "custom" ? "flex" : "none";
  }

  updateTimerDisplay();
}

function toggleTimerPlayPause() {
  if (timerState.isRunning) {
    pauseTimer();
  } else {
    startTimer();
  }
}

function startTimer() {
  if (timerState.isRunning) return;

  getAudioContext();
  timerState.isRunning = true;
  timerState.miniTimerDismissed = false;

  const playIcon = document.getElementById("timerPlayIcon");
  const playText = document.getElementById("timerPlayText");
  const miniPlayBtn = document.getElementById("miniTimerPlayPauseBtn");

  if (playIcon) playIcon.textContent = "⏸";
  if (playText) playText.textContent = "Pause";
  if (miniPlayBtn) miniPlayBtn.textContent = "⏸";

  // Start soundscape if chosen
  if (timerState.soundscape !== "none") {
    startSoundscape(timerState.soundscape);
  }

  timerState.intervalId = setInterval(() => {
    if (timerState.mode === "stopwatch") {
      timerState.elapsedStopwatchSeconds++;
      updateTimerDisplay();
    } else {
      if (timerState.remainingSeconds > 0) {
        timerState.remainingSeconds--;
        updateTimerDisplay();
        if (timerState.remainingSeconds === 0) {
          completeTimerSession();
        }
      }
    }
  }, 1000);

  updateTimerDisplay();
  syncFloatingMiniTimer();
}

function pauseTimer() {
  if (!timerState.isRunning && !timerState.intervalId) return;

  timerState.isRunning = false;
  if (timerState.intervalId) {
    clearInterval(timerState.intervalId);
    timerState.intervalId = null;
  }

  stopSoundscape();

  const playIcon = document.getElementById("timerPlayIcon");
  const playText = document.getElementById("timerPlayText");
  const miniPlayBtn = document.getElementById("miniTimerPlayPauseBtn");

  if (playIcon) playIcon.textContent = "▶";
  if (playText) playText.textContent = "Resume";
  if (miniPlayBtn) miniPlayBtn.textContent = "▶";

  updateTimerDisplay();
  syncFloatingMiniTimer();
}

function resetTimer() {
  pauseTimer();

  if (timerState.mode === "stopwatch") {
    timerState.elapsedStopwatchSeconds = 0;
  } else {
    timerState.remainingSeconds = timerState.durationMinutes * 60;
  }

  const playText = document.getElementById("timerPlayText");
  if (playText) {
    playText.textContent = timerState.mode.includes("Break") ? "Start Break" : "Start Focus";
  }

  updateTimerDisplay();
  syncFloatingMiniTimer();
}

function completeTimerSession() {
  pauseTimer();

  if (timerState.chimeEnabled) {
    playChimeSound();
  }

  // Fire celebratory confetti!
  if (typeof confetti === "function") {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 }
    });
  }

  const isBreak = timerState.mode === "shortBreak" || timerState.mode === "longBreak";

  if (!isBreak) {
    // Focus Session completed: calculate duration & award XP
    let sessionMinutes = timerState.durationMinutes;
    if (timerState.mode === "stopwatch") {
      sessionMinutes = Math.max(1, Math.round(timerState.elapsedStopwatchSeconds / 60));
    }

    const xpEarned = Math.max(10, sessionMinutes * 2);

    // Record study session into state.studySessions
    const newSession = {
      id: "session_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
      subject: timerState.activeSubject || "General Study",
      durationMinutes: sessionMinutes,
      date: new Date().toISOString().split("T")[0],
      completedAt: new Date().toISOString()
    };

    if (!state.studySessions) state.studySessions = [];
    state.studySessions.unshift(newSession);

    // Grant XP and check level ups
    grantXP(xpEarned);
    updateHUD();

    // Check if user linked an active task
    if (timerState.activeTaskId) {
      const task = (state.tasks || []).find(t => t.id === timerState.activeTaskId);
      if (task && !task.completed) {
        if (confirm(`Awesome focus session! Would you like to mark linked task "${task.title}" as completed (+25 bonus XP)?`)) {
          task.completed = true;
          task.completedAt = new Date().toISOString();
          grantXP(25);
          updateHUD();
        }
      }
    }

    saveProfile();
    renderDashboard();

    // Advance Pomodoro cycle
    if (timerState.mode === "pomodoro") {
      if (timerState.cycleCount < 4) {
        timerState.cycleCount++;
        alert(`🎉 Focus session complete! You earned +${xpEarned} XP!\n\nTime for a 5-minute Short Break (Cycle ${timerState.cycleCount} of 4).`);
        setTimerMode("shortBreak", 5);
      } else {
        timerState.cycleCount = 1;
        alert(`🏆 Outstanding work! You completed a full 4-interval Pomodoro cycle and earned +${xpEarned} XP!\n\nEnjoy a well-deserved 15-minute Long Break.`);
        setTimerMode("longBreak", 15);
      }
    } else {
      alert(`🎉 Focus session complete! You recorded ${sessionMinutes} minutes of study for ${timerState.activeSubject} and earned +${xpEarned} XP!`);
      resetTimer();
    }
  } else {
    // Break completed
    alert("☕ Break finished! Ready to jump into the next focus session?");
    setTimerMode("pomodoro", 25);
  }

  renderTimerView();
}

function updateTimerDisplay() {
  const digitsEl = document.getElementById("timerDigits");
  const ringEl = document.getElementById("timerProgressRing");
  const statusBadge = document.getElementById("timerStatusBadge");
  const cycleLabel = document.getElementById("timerCycleLabel");

  let totalSecs = timerState.durationMinutes * 60;
  let currentSecs = timerState.remainingSeconds;

  if (timerState.mode === "stopwatch") {
    currentSecs = timerState.elapsedStopwatchSeconds;
  }

  // Format MM:SS or HH:MM:SS
  const hrs = Math.floor(currentSecs / 3600);
  const mins = Math.floor((currentSecs % 3600) / 60);
  const secs = currentSecs % 60;

  let formatted = "";
  if (hrs > 0) {
    formatted = `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  } else {
    formatted = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  if (digitsEl) digitsEl.textContent = formatted;

  // Circular ring stroke calculation
  if (ringEl) {
    if (timerState.mode === "stopwatch") {
      // Loop pulse every 60 seconds
      const loopSecs = currentSecs % 60;
      const offset = CIRCUMFERENCE * (1 - (loopSecs / 60));
      ringEl.style.strokeDashoffset = offset;
      ringEl.style.stroke = "var(--color-secondary)";
    } else {
      const progress = totalSecs > 0 ? (currentSecs / totalSecs) : 0;
      const offset = CIRCUMFERENCE * (1 - progress);
      ringEl.style.strokeDashoffset = offset;

      if (timerState.mode.includes("Break")) {
        ringEl.style.stroke = "var(--color-success)";
      } else {
        ringEl.style.stroke = "var(--color-primary)";
      }
    }
  }

  // Badge label and color
  if (statusBadge) {
    if (timerState.mode === "pomodoro") {
      statusBadge.textContent = timerState.isRunning ? "FOCUS INTERVAL" : (currentSecs < totalSecs ? "PAUSED" : "READY TO FOCUS");
      statusBadge.style.color = "var(--color-primary)";
      statusBadge.style.borderColor = "rgba(0, 240, 255, 0.3)";
    } else if (timerState.mode === "shortBreak") {
      statusBadge.textContent = "SHORT BREAK";
      statusBadge.style.color = "var(--color-success)";
      statusBadge.style.borderColor = "rgba(16, 185, 129, 0.3)";
    } else if (timerState.mode === "longBreak") {
      statusBadge.textContent = "LONG BREAK";
      statusBadge.style.color = "var(--color-success)";
      statusBadge.style.borderColor = "rgba(16, 185, 129, 0.3)";
    } else if (timerState.mode === "custom") {
      statusBadge.textContent = timerState.isRunning ? "CUSTOM FOCUS" : "PAUSED";
      statusBadge.style.color = "var(--color-accent)";
      statusBadge.style.borderColor = "rgba(255, 0, 85, 0.3)";
    } else if (timerState.mode === "stopwatch") {
      statusBadge.textContent = timerState.isRunning ? "STOPWATCH RECORDING" : "STOPWATCH PAUSED";
      statusBadge.style.color = "var(--color-secondary)";
      statusBadge.style.borderColor = "rgba(168, 85, 247, 0.3)";
    }
  }

  // Cycle and XP reward label
  if (cycleLabel) {
    if (timerState.mode === "pomodoro") {
      cycleLabel.textContent = `Interval ${timerState.cycleCount} of 4 · +50 XP Reward`;
    } else if (timerState.mode === "shortBreak") {
      cycleLabel.textContent = "Take a breather, stretch, or hydrate 💧";
    } else if (timerState.mode === "longBreak") {
      cycleLabel.textContent = "Great stamina! Relax before next study round 🌴";
    } else if (timerState.mode === "custom") {
      cycleLabel.textContent = `Custom ${timerState.durationMinutes}m Session · +${timerState.durationMinutes * 2} XP`;
    } else if (timerState.mode === "stopwatch") {
      const earnedEstimate = Math.round(timerState.elapsedStopwatchSeconds / 60) * 2;
      cycleLabel.textContent = `Open study mode · ~+${earnedEstimate} XP accumulated`;
    }
  }

  syncFloatingMiniTimer();
}

function updateActiveTargetDisplay() {
  const subjEl = document.getElementById("timerActiveSubjectLabel");
  const taskPill = document.getElementById("timerActiveTaskPill");
  const taskTitleEl = document.getElementById("timerActiveTaskTitle");

  if (subjEl) subjEl.textContent = timerState.activeSubject || "General Study";

  if (taskPill && taskTitleEl) {
    if (timerState.activeTaskId && timerState.activeTaskTitle) {
      taskPill.style.display = "inline";
      taskTitleEl.textContent = timerState.activeTaskTitle;
    } else {
      taskPill.style.display = "none";
    }
  }
}

// Start focus timer specifically tied to an academic task card
function startTimerForTask(task) {
  if (!task) return;

  // Switch to timer view
  document.querySelector('[data-target="timer"]')?.click();

  // Populate active target
  timerState.activeSubject = task.subject || "General Study";
  timerState.activeTaskId = task.id;
  timerState.activeTaskTitle = task.title;

  const subjectSelect = document.getElementById("timerSubjectSelect");
  const taskSelect = document.getElementById("timerTaskSelect");
  if (subjectSelect) subjectSelect.value = timerState.activeSubject;
  if (taskSelect) taskSelect.value = task.id;

  updateActiveTargetDisplay();
  setTimerMode("pomodoro", 25);
  startTimer();
}

function populateTimerSelectors() {
  const subjectSelect = document.getElementById("timerSubjectSelect");
  const logSubjSelect = document.getElementById("logSessionSubjectInput");
  const taskSelect = document.getElementById("timerTaskSelect");

  const subjectsSet = new Set(["General Study"]);
  (state.subjects || []).forEach(s => {
    if (s.name && s.name.trim()) subjectsSet.add(s.name.trim());
  });
  (state.tasks || []).forEach(t => {
    if (t.subject && t.subject.trim()) subjectsSet.add(t.subject.trim());
  });

  const subjectList = Array.from(subjectsSet);

  if (subjectSelect) {
    const prev = subjectSelect.value;
    subjectSelect.innerHTML = "";
    subjectList.forEach(s => {
      const opt = document.createElement("option");
      opt.value = s;
      opt.textContent = s;
      subjectSelect.appendChild(opt);
    });
    if (subjectList.includes(prev)) {
      subjectSelect.value = prev;
    } else {
      subjectSelect.value = "General Study";
    }
  }

  if (logSubjSelect) {
    const prev = logSubjSelect.value;
    logSubjSelect.innerHTML = "";
    subjectList.forEach(s => {
      const opt = document.createElement("option");
      opt.value = s;
      opt.textContent = s;
      logSubjSelect.appendChild(opt);
    });
    if (subjectList.includes(prev)) {
      logSubjSelect.value = prev;
    } else {
      logSubjSelect.value = "General Study";
    }
  }

  if (taskSelect) {
    const pendingTasks = (state.tasks || []).filter(t => !t.completed);
    taskSelect.innerHTML = `<option value="">None (Independent Study)</option>`;
    pendingTasks.forEach(t => {
      const opt = document.createElement("option");
      opt.value = t.id;
      opt.textContent = `${t.title} [${t.subject || 'General'}]`;
      taskSelect.appendChild(opt);
    });
    if (timerState.activeTaskId) {
      taskSelect.value = timerState.activeTaskId;
    }
  }
}

function renderTimerView() {
  populateTimerSelectors();
  updateActiveTargetDisplay();
  updateTimerDisplay();

  // Metrics
  const sessions = state.studySessions || [];
  const todayStr = new Date().toISOString().split("T")[0];

  const todaySessions = sessions.filter(s => s.date === todayStr);
  const todayMinutes = todaySessions.reduce((acc, s) => acc + (Number(s.durationMinutes) || 0), 0);
  const totalMinutes = sessions.reduce((acc, s) => acc + (Number(s.durationMinutes) || 0), 0);
  const totalXp = sessions.reduce((acc, s) => acc + ((Number(s.durationMinutes) || 0) * 2), 0);

  const todayFocusEl = document.getElementById("timerMetricTodayFocus");
  const sessionsTodayEl = document.getElementById("timerMetricSessionsToday");
  const totalStudyEl = document.getElementById("timerMetricTotalStudy");
  const xpEarnedEl = document.getElementById("timerMetricXpEarned");

  if (todayFocusEl) {
    const hrs = Math.floor(todayMinutes / 60);
    const mins = todayMinutes % 60;
    todayFocusEl.textContent = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  }

  if (sessionsTodayEl) sessionsTodayEl.textContent = todaySessions.length;
  if (totalStudyEl) totalStudyEl.textContent = getTotalRecordedStudyTime();
  if (xpEarnedEl) xpEarnedEl.textContent = `+${totalXp} XP`;

  renderTimerHistory();
  syncFloatingMiniTimer();
}

function renderTimerHistory() {
  const tableBody = document.getElementById("timerSessionsTableBody");
  const emptyState = document.getElementById("timerSessionsEmptyState");
  const countBadge = document.getElementById("timerSessionsCountBadge");

  const sessions = state.studySessions || [];
  if (countBadge) countBadge.textContent = `${sessions.length} session${sessions.length !== 1 ? 's' : ''}`;

  if (!tableBody) return;
  tableBody.innerHTML = "";

  if (sessions.length === 0) {
    if (emptyState) emptyState.style.display = "block";
    return;
  }

  if (emptyState) emptyState.style.display = "none";

  // Reverse chronological
  const sorted = sessions.slice().sort((a, b) => {
    return (b.completedAt || b.date || "").localeCompare(a.completedAt || a.date || "");
  });

  sorted.forEach(s => {
    const tr = document.createElement("tr");

    let dateDisplay = s.date;
    if (s.completedAt && s.completedAt.includes("T")) {
      const dt = new Date(s.completedAt);
      if (!isNaN(dt.getTime())) {
        dateDisplay = dt.toLocaleDateString() + " " + dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
    }

    const durationMins = Number(s.durationMinutes) || 0;
    const xp = durationMins * 2;

    tr.innerHTML = `
      <td style="color:var(--text-muted); font-family:monospace; font-size:12px;">${escapeHTML(dateDisplay)}</td>
      <td>
        <span class="task-subject-tag" style="background:rgba(0,240,255,0.08); color:var(--color-primary); border-color:rgba(0,240,255,0.2);">
          ${escapeHTML(s.subject || 'General Study')}
        </span>
      </td>
      <td style="font-weight:700; color:var(--text-main);">${durationMins} mins</td>
      <td style="color:var(--color-success); font-weight:700;">+${xp} XP</td>
      <td style="text-align:right;">
        <button class="task-action-btn delete-btn" title="Delete Session Record" aria-label="Delete Session" data-session-id="${escapeHTML(s.id)}" style="background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:14px;">🗑️</button>
      </td>
    `;

    tr.querySelector('[data-session-id]').addEventListener("click", () => {
      deleteStudySession(s.id);
    });

    tableBody.appendChild(tr);
  });
}

function deleteStudySession(sessionId) {
  if (!confirm("Are you sure you want to remove this study session record?")) return;

  state.studySessions = (state.studySessions || []).filter(s => s.id !== sessionId);
  saveProfile();
  renderDashboard();
  renderTimerView();
}

// Manual offline study logging modal
function openLogSessionModal() {
  const modal = document.getElementById("logSessionModal");
  if (!modal) return;

  populateTimerSelectors();

  const dateInput = document.getElementById("logSessionDateInput");
  const durationInput = document.getElementById("logSessionDurationInput");
  const previewEl = document.getElementById("logSessionXpPreview");
  const notesInput = document.getElementById("logSessionNotesInput");

  if (dateInput) dateInput.value = new Date().toISOString().split("T")[0];
  if (durationInput) durationInput.value = 45;
  if (previewEl) previewEl.textContent = "+90 XP";
  if (notesInput) notesInput.value = "";

  modal.classList.add("active");
}

function closeLogSessionModal() {
  document.getElementById("logSessionModal")?.classList.remove("active");
}

function handleSaveOfflineSession() {
  const subj = document.getElementById("logSessionSubjectInput").value || "General Study";
  const duration = parseInt(document.getElementById("logSessionDurationInput").value, 10);
  const date = document.getElementById("logSessionDateInput").value;
  const notes = document.getElementById("logSessionNotesInput").value.trim();

  if (isNaN(duration) || duration < 5 || duration > 600) {
    alert("Please provide a valid study duration between 5 and 600 minutes.");
    return;
  }
  if (!date) {
    alert("Please select a study date.");
    return;
  }

  const xpEarned = duration * 2;
  const newSession = {
    id: "session_manual_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
    subject: subj.slice(0, 50),
    durationMinutes: duration,
    date: date,
    completedAt: new Date(date).toISOString(),
    notes: notes.slice(0, 200)
  };

  if (!state.studySessions) state.studySessions = [];
  state.studySessions.unshift(newSession);

  grantXP(xpEarned);
  saveProfile();

  closeLogSessionModal();
  renderDashboard();
  renderTimerView();

  alert(`Recorded ${duration} minutes offline study session for ${subj}! Earned +${xpEarned} XP!`);
}

// Sync floating mini-timer pill across non-timer tabs
function syncFloatingMiniTimer() {
  const miniTimer = document.getElementById("floatingMiniTimer");
  if (!miniTimer) return;

  const currentTab = document.querySelector(".sidebar-menu .menu-item.active")?.getAttribute("data-target");

  // Only show when not on timer view, timer is active or has elapsed time, and not dismissed
  if (currentTab !== "timer" && (timerState.isRunning || (timerState.remainingSeconds < timerState.durationMinutes * 60 && timerState.remainingSeconds > 0) || timerState.elapsedStopwatchSeconds > 0) && !timerState.miniTimerDismissed) {
    miniTimer.style.display = "flex";

    const digitsEl = document.getElementById("miniTimerDigits");
    const subjEl = document.getElementById("miniTimerSubject");
    const iconEl = document.getElementById("miniTimerIcon");

    const currentSecs = timerState.mode === "stopwatch" ? timerState.elapsedStopwatchSeconds : timerState.remainingSeconds;
    const mins = Math.floor(currentSecs / 60);
    const secs = currentSecs % 60;

    if (digitsEl) digitsEl.textContent = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    if (subjEl) subjEl.textContent = timerState.activeSubject || "Study";
    if (iconEl) iconEl.textContent = timerState.mode.includes("Break") ? "☕" : "⏱️";
  } else {
    miniTimer.style.display = "none";
  }
}


