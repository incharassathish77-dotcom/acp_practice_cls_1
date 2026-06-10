// communityData.js
// Mock community posts, study groups, and leaderboard rankings

const LEADERBOARD_INITIAL = [
  { rank: 1, name: "Satoshi_AI", title: "AI Architect", level: 9, xp: 9450, avatar: "🧙‍♂️", active: true },
  { rank: 2, name: "CodeViber", title: "Vibe Coding Master", level: 7, xp: 7100, avatar: "🎧", active: false },
  { rank: 3, name: "Pythonista_Pro", title: "AI Explorer", level: 6, xp: 6200, avatar: "🐍", active: false },
  { rank: 4, name: "PromptPrincess", title: "Prompt Wizard", level: 5, xp: 5120, avatar: "✨", active: false },
  { rank: 5, name: "DataDiva", title: "AI Explorer", level: 4, xp: 4300, avatar: "📊", active: false },
  { rank: 6, name: "Ada_Lovelace_2", title: "Rookie Learner", level: 3, xp: 3200, avatar: "👩‍💻", active: false },
  { rank: 7, name: "Noob_Learns_AI", title: "Rookie Learner", level: 2, xp: 1800, avatar: "🐣", active: false }
];

const COMMUNITY_FEED_INITIAL = [
  {
    id: "post_1",
    author: "CodeViber",
    avatar: "🎧",
    title: "Vibe Coding Master",
    content: "Just prompted a fully functioning Flask web app in Cursor in under 15 minutes! The ReAct loop did exactly what I wanted. Vibe coding is real, y'all! 🔥 Check out my prompt pipeline in the dashboard showcase.",
    likes: 24,
    comments: 5,
    timestamp: "2 hours ago",
    category: "Vibe Coding"
  },
  {
    id: "post_2",
    author: "Satoshi_AI",
    avatar: "🧙‍♂️",
    title: "AI Architect",
    content: "Reminder for anyone studying Deep Learning: ReLU activation is crucial for hidden layers to avoid vanishing gradients, but make sure to use Softmax at the very output for multi-class classification! 🧠",
    likes: 42,
    comments: 12,
    timestamp: "5 hours ago",
    category: "AI Fundamentals"
  },
  {
    id: "post_3",
    author: "PromptPrincess",
    avatar: "✨",
    title: "Prompt Wizard",
    content: "If you're having trouble getting structured JSON from ChatGPT, try using the system prompt: 'Output exclusively a JSON object conforming to the schema: {result: String}. Do not write introductions or explanations.' Works every time!",
    likes: 18,
    comments: 3,
    timestamp: "1 day ago",
    category: "Prompt Engineering"
  },
  {
    id: "post_4",
    author: "DataDiva",
    avatar: "📊",
    title: "AI Explorer",
    content: "Pandas `.groupby()` is an absolute life-saver for aggregating data files. Cleaned a dataset of 50k rows today and visualized it with a Seaborn heatmap. Check out the study lounge details if you want a copy of the notebook!",
    likes: 15,
    comments: 2,
    timestamp: "1 day ago",
    category: "Data Science"
  }
];

const STUDY_GROUPS = [
  {
    id: "group_ai_agents",
    name: "Autonomous Agents Syndicate",
    description: "For intermediate learners building loops using LangChain, CrewAI, and custom tools.",
    members: 142,
    track: "AI Fundamentals",
    joined: false
  },
  {
    id: "group_python_noobs",
    name: "Python Beginners Circle",
    description: "Weekly peer reviews, variables tutoring, and basic script testing for coding beginners.",
    members: 310,
    track: "Programming",
    joined: false
  },
  {
    id: "group_prompt_hacking",
    name: "Prompt Hacking & Security",
    description: "Testing prompt injection boundaries, guardrails, and jailbreaks in a safe environment.",
    members: 89,
    track: "Prompt Engineering",
    joined: false
  },
  {
    id: "group_vibe_coders",
    name: "Vibe Coding Innovators",
    description: "Share screen setups, prompts, IDE updates, and showcase projects made with Cursor and Copilot.",
    members: 204,
    track: "Vibe Coding",
    joined: false
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LEADERBOARD_INITIAL, COMMUNITY_FEED_INITIAL, STUDY_GROUPS };
}
