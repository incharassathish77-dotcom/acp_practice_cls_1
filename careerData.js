// careerData.js
// Career paths, descriptions, required skills, and roadmap descriptions for the Career Advisor

const CAREER_DATA = {
  "software_developer": {
    id: "software_developer",
    title: "Software Developer",
    icon: "💻",
    salary: "$115,000",
    description: "Build, debug, and maintain modern web applications, desktop programs, and system backends. Focuses heavily on logic, coding speed, and architectural clean code.",
    requiredSkills: ["prog_fundamentals", "python", "web_dev", "data_structures"],
    roadmap: [
      "Step 1: Learn core programming fundamentals and logic loops.",
      "Step 2: Master Python syntax and clean structures.",
      "Step 3: Dive into Web Dev (HTML/CSS/JS) to build interfaces.",
      "Step 4: Master Data Structures & Algorithms to write scalable code."
    ]
  },
  "ai_engineer": {
    id: "ai_engineer",
    title: "AI Engineer",
    icon: "🤖",
    salary: "$145,000",
    description: "Build neural networks, fine-tune models, optimize training datasets, and deploy intelligent agent frameworks. Integrates complex models into production applications.",
    requiredSkills: ["prog_fundamentals", "python", "ai_fundamentals", "machine_learning", "deep_learning", "prompt_eng", "ai_agents"],
    roadmap: [
      "Step 1: Master basic Python operations.",
      "Step 2: Understand AI history, neural weight networks, and self-attention.",
      "Step 3: Build Regression and Classification models in ML.",
      "Step 4: Train Deep Networks and configure prompt flows.",
      "Step 5: Architect autonomous agent loops using ReAct and RAG databases."
    ]
  },
  "data_scientist": {
    id: "data_scientist",
    title: "Data Scientist",
    icon: "📊",
    salary: "$125,000",
    description: "Extract insights from complex, messy datasets. Build regression and clustering models, perform visual analytics, and present findings to guide business actions.",
    requiredSkills: ["prog_fundamentals", "python", "ai_fundamentals", "machine_learning", "data_science"],
    roadmap: [
      "Step 1: Gain comfort with Python lists and dictionaries.",
      "Step 2: Understand supervised and unsupervised ML structures.",
      "Step 3: Master Pandas dataframes and Matplotlib visual graphs.",
      "Step 4: Apply ML models to perform predictive analytics."
    ]
  },
  "prompt_engineer": {
    id: "prompt_engineer",
    title: "Prompt Engineer",
    icon: "✍️",
    salary: "$110,000",
    description: "Design and optimize structured prompts to guide AI models. Secure systems against prompt injection, configure custom GPT assistants, and establish temperature presets.",
    requiredSkills: ["ai_fundamentals", "prompt_eng", "ai_tool_mastery", "chatbots"],
    roadmap: [
      "Step 1: Understand transformer tokens and basic attention concepts.",
      "Step 2: Master AI Tool basics and chat ecosystems.",
      "Step 3: Implement Chain-of-Thought, Few-Shot, and System instructions.",
      "Step 4: Fine-tune prompts by configuring Temperature and Top P limits."
    ]
  },
  "vibe_coder": {
    id: "vibe_coder",
    title: "Vibe Coder / AI Product builder",
    icon: "🎵",
    salary: "$120,000",
    description: "Rapidly build and launch applications by acting as an orchestrator. Leverage AI code assistants and prompt generators to write full systems with minimal manual typing.",
    requiredSkills: ["prog_fundamentals", "python", "web_dev", "prompt_eng", "vibe_coding", "coding_assistants"],
    roadmap: [
      "Step 1: Learn basic loops and variables to read structures.",
      "Step 2: Study Web Dev elements to understand page components.",
      "Step 3: Master AI IDE integrations (Cursor, Copilot) for code generation.",
      "Step 4: Master prompt iteration and Vibe Coding project templates."
    ]
  },
  "ai_architect": {
    id: "ai_architect",
    title: "AI Solutions Architect",
    icon: "🏰",
    salary: "$175,000",
    description: "Design large-scale enterprise systems integrating multiple agents, vector search indexes, deep networks, and clean codebases. The ultimate learning target.",
    requiredSkills: [
      "prog_fundamentals", "python", "web_dev", "data_structures",
      "ai_fundamentals", "machine_learning", "deep_learning", "prompt_eng",
      "ai_agents", "data_science", "vibe_coding", "ai_tool_mastery",
      "chatbots", "coding_assistants", "generative_media"
    ],
    roadmap: [
      "Step 1: Complete all foundational skills across programming, tools, and AI.",
      "Step 2: Unlock advanced specializations: Deep Learning, Vibe Coding, and Generative Media.",
      "Step 3: Complete complex project milestones to prove full architectural mastery."
    ]
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CAREER_DATA };
}
