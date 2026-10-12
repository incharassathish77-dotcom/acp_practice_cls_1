// portfolioData.js
// Structured profile, project showcase, skills, and credentials data.
// You can edit your personal details, projects, and links directly here.

const PORTFOLIO_DATA = {
  profile: {
    name: "Inchara S",
    title: "Software Engineer & AI Solutions Developer",
    statusBadge: "Available for Internships & Full-Time Roles",
    location: "Bengaluru, India",
    bio: "Passionate software engineer specializing in scalable full-stack web applications, modern JavaScript systems, and applied AI tools. Enthusiastic about clean UI architecture, human-centered design, and high-performance algorithms.",
    email: "incharassathish77@gmail.com",
    github: "https://github.com/incharassathish77-dotcom",
    linkedin: "https://linkedin.com", // update with your personal handle
    resumeUrl: "#contact", // or link to PDF in your repo/Drive
    yearsOfCoding: "3+ Years",
    projectsBuilt: "15+ Projects",
    hackathonsAttended: "4 Hackathons"
  },

  skills: [
    {
      category: "Languages",
      skills: ["JavaScript (ES6+)", "Python", "TypeScript", "C++", "HTML5", "CSS3 / Sass"]
    },
    {
      category: "Frontend & UI",
      skills: ["React.js", "Tailwind CSS", "Vanilla JavaScript", "Responsive Design", "Web Accessibility (WCAG)", "CSS Architecture"]
    },
    {
      category: "Backend & Systems",
      skills: ["Node.js", "Express.js", "RESTful APIs", "PostgreSQL", "MongoDB", "Python Flask/FastAPI"]
    },
    {
      category: "Developer Tools & Cloud",
      skills: ["Git & GitHub", "Docker Basics", "Vite", "Linux / Bash", "npm / yarn", "CI/CD Workflows"]
    },
    {
      category: "AI & Emerging Tech",
      skills: ["Prompt Engineering", "LLM APIs (Gemini/OpenAI)", "RAG Systems", "Vector Embeddings", "AI-Assisted Development"]
    }
  ],

  projects: [
    {
      id: "project_skill_tree",
      title: "Interactive RPG Skill Tree & Gamified Learning Lab",
      category: "Full-Stack Web & EdTech",
      summary: "An interactive, client-side gamified skill acquisition simulator featuring SVG dynamic connection trees, AI mentoring, code sandboxes, and learning analytics.",
      highlights: [
        "Architected an interactive SVG canvas rendering dependency links across 15+ skill nodes with zero external rendering frameworks.",
        "Built simulated AI Mentor and Career Advisor modules with custom gap-analysis algorithms and study plan generators.",
        "Implemented real-time client state persistence, daily streak tracking, knowledge quizzes, and responsive themes."
      ],
      techStack: ["JavaScript", "HTML5 / CSS3", "Chart.js", "Express.js", "SVG DOM", "localStorage"],
      githubUrl: "https://github.com/incharassathish77-dotcom/acp_practice_cls_1",
      liveDemoUrl: "https://aipoweredskilltreesimulator.vercel.app/",
      featured: true,
      internalViewTarget: "skilltree" // Can jump directly into the interactive simulator
    },
    {
      id: "project_ai_study_copilot",
      title: "AI-Powered Smart Career Advisor & Study Planner",
      category: "Artificial Intelligence & Analytics",
      summary: "Rule-based recommendation engine evaluating developer skill gaps against target industry career tracks with visual radar analytics.",
      highlights: [
        "Evaluates missing prerequisites and ranks optimal next learning milestones for 6 industry career profiles.",
        "Visualizes multi-dimensional track competency distributions using dynamic Chart.js radar charts.",
        "Generates tailored 7-day schedules based on hourly availability and active student streak records."
      ],
      techStack: ["JavaScript", "Chart.js", "Algorithms", "EdTech", "Analytics"],
      githubUrl: "https://github.com/incharassathish77-dotcom/acp_practice_cls_1",
      liveDemoUrl: "https://aipoweredskilltreesimulator.vercel.app/",
      featured: true,
      internalViewTarget: "career"
    },
    {
      id: "project_vibe_hub",
      title: "Vibe Coding Simulator & Virtual Code Runner",
      category: "Developer Tooling",
      summary: "In-browser workspace allowing students to turn natural language product specifications into scaffolded projects with simulated code streaming.",
      highlights: [
        "Simulates multi-file code generation and file tree scaffolding in real-time.",
        "Interactive milestone checklists track progressive architectural development stages.",
        "Built-in interactive sandbox runs HTML/JS previews directly in the browser."
      ],
      techStack: ["JavaScript", "DOM Architecture", "CSS Animations", "UI/UX"],
      githubUrl: "https://github.com/incharassathish77-dotcom/acp_practice_cls_1",
      liveDemoUrl: "https://aipoweredskilltreesimulator.vercel.app/",
      featured: true,
      internalViewTarget: "vibe"
    },
    {
      id: "project_community_guilds",
      title: "Collaborative Student Lounge & Real-Time Leaderboard",
      category: "Social & Gamification",
      summary: "Gamified community platform with dynamic player rankings, XP leaderboard calculations, joinable study guilds, and discussion feeds.",
      highlights: [
        "Dynamic leaderboard ranking algorithm recalculating active user positions against peer benchmarks.",
        "Study guild management system enabling students to join squads and earn collaborative study XP.",
        "Interactive feed with persistent engagement states and categorized developer discourse."
      ],
      techStack: ["JavaScript", "State Management", "Gamification", "CSS Grid"],
      githubUrl: "https://github.com/incharassathish77-dotcom/acp_practice_cls_1",
      liveDemoUrl: "https://aipoweredskilltreesimulator.vercel.app/",
      featured: false,
      internalViewTarget: "community"
    }
  ],

  education: [
    {
      institution: "Bachelor of Engineering (Computer Science / Engineering)",
      location: "Bengaluru, India",
      period: "2022 - Present",
      grade: "First Class with Distinction",
      details: "Core Coursework: Data Structures & Algorithms, Object-Oriented Programming, Database Management Systems, Computer Networks, Operating Systems, Software Engineering."
    }
  ],

  achievements: [
    {
      title: "Active Open-Source Contributor & Builder",
      description: "Developed and published interactive developer education tools with over 15 dynamic skill nodes and browser-based simulations."
    },
    {
      title: "Hackathon Participant & Innovator",
      description: "Designed rapid-prototype solutions bridging AI productivity tooling and student-friendly gamified workflows."
    },
    {
      title: "Technical Community Leader",
      description: "Mentoring junior peers on web development fundamentals, Git collaboration, and modern frontend best practices."
    }
  ]
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PORTFOLIO_DATA };
}
