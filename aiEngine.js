// aiEngine.js
// Simulates the AI intelligence for Mentor chats, Challenge generation, Career advice, and Vibe Coding

const AI_ENGINE = {
  // --- AI MENTOR ---
  
  // Suggest the next node for a student based on unlocked nodes and interests
  getRecommendation: function(userProfile) {
    const unlocked = userProfile.unlockedNodes || [];
    const targetCareerId = userProfile.targetCareer || "software_developer";
    const career = CAREER_DATA[targetCareerId] || CAREER_DATA["software_developer"];
    
    // Find required skills for this career that are not unlocked yet
    const gaps = career.requiredSkills.filter(skillId => !unlocked.includes(skillId));
    
    if (gaps.length > 0) {
      // Find one gap that has all its prerequisites unlocked
      for (let skillId of gaps) {
        const skill = SKILLS_DATA[skillId];
        if (!skill) continue;
        const prereqsMet = skill.prerequisites.every(pr => unlocked.includes(pr));
        if (prereqsMet) {
          return {
            skillId: skillId,
            name: skill.label,
            reason: `Since your target career is **${career.title}**, unlocking **${skill.label}** is your optimal next step. You have unlocked all its prerequisites, and it directly fills a critical skill gap!`,
            advice: "Try completing the quick lesson slides and testing your knowledge in the Challenge Arena for this node to unlock it."
          };
        }
      }
      
      // If none of the immediate gaps have prerequisites met, find a prerequisite node that is locked
      for (let skillId of gaps) {
        const skill = SKILLS_DATA[skillId];
        if (!skill) continue;
        for (let pr of skill.prerequisites) {
          if (!unlocked.includes(pr)) {
            const prSkill = SKILLS_DATA[pr];
            if (prSkill) {
              return {
                skillId: pr,
                name: prSkill.label,
                reason: `To eventually unlock **${skill.label}** for your **${career.title}** career path, you must first master its prerequisite: **${prSkill.label}**.`,
                advice: "Unlocking foundational skills early establishes a strong basis for advanced topics like Neural Networks or Vibe Coding."
              };
            }
          }
        }
      }
    }
    
    // If they have unlocked all career requirements, recommend other non-unlocked nodes
    for (let key in SKILLS_DATA) {
      if (!unlocked.includes(key)) {
        const skill = SKILLS_DATA[key];
        const prereqsMet = skill.prerequisites.every(pr => unlocked.includes(pr));
        if (prereqsMet) {
          return {
            skillId: key,
            name: skill.label,
            reason: `Outstanding! You have mastered your core career roadmap. I recommend expanding your skillset into **${skill.label}** in the **${skill.track}** path to broaden your profile.`,
            advice: "Expanding your skillset across paths makes you a versatile AI solutions architect."
          };
        }
      }
    }
    
    return {
      skillId: null,
      name: "All Skills Mastered!",
      reason: "Incredible! You have unlocked every skill node in the simulator tree. You are officially an AI Architect!",
      advice: "Try creating custom projects in the Vibe Coding Hub, hosting peer tutoring groups in the Community Lounge, or starting a new speed-run profile!"
    };
  },

  // Generate a custom weekly study plan
  generateStudyPlan: function(userProfile, availabilityHours) {
    const hours = parseInt(availabilityHours) || 2;
    const targetCareer = CAREER_DATA[userProfile.targetCareer || "software_developer"]?.title || "AI Generalist";
    
    let plan = `### 📅 7-Day Study Plan: Target Career - ${targetCareer} (${hours} hrs/day)\n\n`;
    plan += `Based on your profile, strengths, and current unlocked nodes, here is your customized plan:\n\n`;
    
    if (hours < 2) {
      plan += `*   **Day 1-2**: Review lesson slides for your recommended next skill (15 mins). Complete 1 glossary check.\n`;
      plan += `*   **Day 3-4**: Take a quiz in the Challenge Arena (20 mins) to earn XP. Review explanations.\n`;
      plan += `*   **Day 5-6**: Start a mini-project in the Vibe Coding Hub (30 mins) to apply concepts practically.\n`;
      plan += `*   **Day 7**: Weekly review. Engage with community posts, check leaderboard ranks, and plan next targets.`;
    } else if (hours >= 2 && hours <= 4) {
      plan += `*   **Day 1-2**: Deep study of recommended skill nodes. Read documentation links, run sample code blocks (45 mins/day).\n`;
      plan += `*   **Day 3-4**: Complete quizzes for two separate nodes. Solve coding challenges. Review gap analyses (60 mins/day).\n`;
      plan += `*   **Day 5-6**: Build an intermediate Vibe Coding project from scratch. Check file roadmaps (90 mins/day).\n`;
      plan += `*   **Day 7**: Review glossary terms. Participate in a community study group, solve peer questions, and check ranks.`;
    } else {
      plan += `*   **Day 1-2**: Immersive learning track. Complete entire foundations path. Practice prompt engineering rules (2 hrs/day).\n`;
      plan += `*   **Day 3-4**: Core specialization. Set up local neural nets or build data analysis scripts in Pandas (2.5 hrs/day).\n`;
      plan += `*   **Day 5-6**: Advanced Vibe Coding & Agent systems. Integrate vectors and run autonomous tool checks (3 hrs/day).\n`;
      plan += `*   **Day 7**: Full review. Conduct a glossary speed-run, post a showcase project to the community feed, and claim titles.`;
    }
    
    return plan;
  },

  // Custom AI feedback based on performance
  getChatResponse: function(userMessage, userProfile) {
    const message = userMessage.toLowerCase();
    const unlocked = userProfile.unlockedNodes || [];
    
    // Check keyword routing
    if (message.includes("recommend") || message.includes("next skill") || message.includes("what should i learn")) {
      const rec = this.getRecommendation(userProfile);
      return `**AI Mentor:**\n\n${rec.reason}\n\n*Actionable Tip:* ${rec.advice}`;
    }
    
    if (message.includes("study plan") || message.includes("schedule") || message.includes("calendar")) {
      const hours = message.match(/\d+/) ? message.match(/\d+/)[0] : 2;
      return `**AI Mentor:**\n\nHere is a tailored study schedule for you:\n\n${this.generateStudyPlan(userProfile, hours)}`;
    }
    
    if (message.includes("career") || message.includes("job") || message.includes("salary")) {
      const careerId = userProfile.targetCareer || "software_developer";
      const career = CAREER_DATA[careerId];
      if (career) {
        const gapAnalysis = this.analyzeCareerGap(userProfile, careerId);
        return `**AI Mentor (Career Coach):**\n\nYour target path is **${career.title}**. You have unlocked **${gapAnalysis.unlockedCount} / ${gapAnalysis.totalCount}** required skills (${gapAnalysis.percent}% complete).\n\n*Remaining Gap Nodes:* ${gapAnalysis.gaps.map(g => `\`${SKILLS_DATA[g]?.label}\``).join(", ") || "None! You are ready!"}\n\n*Career Tip:* Unlocking Python and Web Development creates a versatile platform for building AI interfaces.`;
      }
    }
    
    if (message.includes("vibe") || message.includes("cursor") || message.includes("copilot")) {
      return `**AI Mentor:**\n\nVibe Coding lets you shift focus from typing syntax to designing systems and architectures. To get started, head over to the **Vibe Coding Hub** in the sidebar, input a prompt (like 'Create a weather website'), and prompt the AI to code it while you oversee milestones!`;
    }

    // Match glossary terms
    for (let key in GLOSSARY_DATA) {
      if (message.includes(key) || message.includes(GLOSSARY_DATA[key].term.toLowerCase())) {
        const item = GLOSSARY_DATA[key];
        return `**AI Mentor:**\n\nLet's discuss **${item.term}**:\n\n${item.definition}\n\n*Analogy:* ${item.explanation}\n\n*Related topics to explore:* ${item.related.join(", ")}`;
      }
    }

    // Default conversational response
    return `**AI Mentor:**\n\nHello, ${userProfile.username}! I am analyzing your learning analytics. You are currently **Level ${userProfile.level}** with a **${userProfile.streak}-day streak**.\n\nYou have unlocked **${unlocked.length} skill nodes** out of **${Object.keys(SKILLS_DATA).length}** total. Ask me things like:\n\n1. *"Recommend my next skill node"* \n2. *"Generate a study plan for 3 hours"* \n3. *"Explain RAG and Vector Databases"* \n4. *"Analyze my career options"*`;
  },

  // --- AI CHALLENGE GENERATOR ---

  // Check if a code challenge submission matches expected string
  checkCodeChallenge: function(nodeId, inputCode) {
    const skill = SKILLS_DATA[nodeId];
    if (!skill || !skill.challenge) {
      return { success: false, feedback: "No challenge found for this node." };
    }
    
    const cleanInput = inputCode.replace(/\s+/g, '').trim();
    const cleanExpected = skill.challenge.expected.replace(/\s+/g, '').trim();
    
    if (cleanInput.includes(cleanExpected)) {
      return {
        success: true,
        feedback: `**AI Evaluator:** Correct! ${skill.challenge.feedback}`
      };
    } else {
      return {
        success: false,
        feedback: `**AI Evaluator:** Not quite. Expected to see '${skill.challenge.expected}' in your submission. Try checking the syntax structure again!`
      };
    }
  },

  // --- AI CAREER ADVISOR ---

  // Compute percentage progress, skills acquired, and roadmap gaps for a career
  analyzeCareerGap: function(userProfile, careerId) {
    const career = CAREER_DATA[careerId];
    if (!career) return null;
    
    const unlocked = userProfile.unlockedNodes || [];
    const required = career.requiredSkills;
    
    const unlockedRequired = required.filter(s => unlocked.includes(s));
    const gaps = required.filter(s => !unlocked.includes(s));
    
    const unlockedCount = unlockedRequired.length;
    const totalCount = required.length;
    const percent = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 100;
    
    return {
      title: career.title,
      unlockedCount: unlockedCount,
      totalCount: totalCount,
      percent: percent,
      gaps: gaps,
      unlockedRequired: unlockedRequired,
      roadmap: career.roadmap
    };
  },

  // --- VIBE CODING GENERATOR ---

  // Take a prompt and generate a complete roadmap, milestones, and virtual files
  generateProject: function(prompt, userProfile) {
    const p = prompt.toLowerCase();
    let type = "web";
    let title = "Custom Web Application";
    
    if (p.includes("python") || p.includes("script") || p.includes("scrape")) {
      type = "python";
      title = "Python Automation Script";
    } else if (p.includes("ai") || p.includes("agent") || p.includes("bot") || p.includes("rag")) {
      type = "agent";
      title = "AI Intelligent Agent";
    } else if (p.includes("data") || p.includes("viz") || p.includes("csv") || p.includes("chart")) {
      type = "data";
      title = "Data Insights Dashboard";
    } else {
      type = "web";
      title = p.trim().length > 30 ? p.trim().slice(0, 30) + "..." : p.trim() || "Dynamic Landing Page";
      // Capitalize first letters
      title = title.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    }
    
    const files = {};
    const milestones = [
      { id: "m1", title: "Initialize Project Structure", desc: "Setting up codebase files and imports", done: false },
      { id: "m2", title: "Build Logic Architecture", desc: "Implement key processing functions and helper scripts", done: false },
      { id: "m3", title: "Implement Interactive Interface", desc: "Design page styling or terminal feedback readouts", done: false },
      { id: "m4", title: "Test Integration & Finalize", desc: "Compile loops, verify edge outputs, and complete", done: false }
    ];

    if (type === "web") {
      files["index.html"] = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="card">
        <h1>🚀 Welcoming: ${title}</h1>
        <p>Vibe Coded using HTML, CSS, and AI Co-pilots!</p>
        <button id="actionBtn">Click to Vibe</button>
        <div id="output">Ready to execute.</div>
    </div>
    <script src="script.js"></script>
</body>
</html>`;

      files["style.css"] = `body {
    background: linear-gradient(135deg, #0f172a, #1e1b4b);
    color: #e2e8f0;
    font-family: system-ui, sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    margin: 0;
}
.card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 32px;
    text-align: center;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}
button {
    background: #06b6d4;
    color: #0f172a;
    border: none;
    padding: 12px 24px;
    font-size: 16px;
    font-weight: bold;
    border-radius: 8px;
    cursor: pointer;
    transition: 0.3s;
}
button:hover {
    background: #22d3ee;
    transform: translateY(-2px);
}`;

      files["script.js"] = `// Dynamic scripts generated for ${title}
document.getElementById('actionBtn').addEventListener('click', () => {
    const output = document.getElementById('output');
    output.style.color = '#34d399';
    output.innerText = '✨ AI Vibe logic connected successfully! Stream running smoothly.';
    
    // Add micro animation
    const card = document.querySelector('.card');
    card.style.transform = 'scale(1.02)';
    setTimeout(() => card.style.transform = 'scale(1)', 200);
});`;
    } 
    
    else if (type === "python") {
      files["main.py"] = `# Python Automation script for: ${title}
import os
import sys
import time

def scrape_and_format():
    print("[*] Launching web automation task...")
    time.sleep(1)
    dataset = ["Python Core", "Data Viz", "Neural Nets", "Vibe Coding"]
    print(f"[*] Fetched {len(dataset)} items from source URL.")
    
    for i, item in enumerate(dataset, 1):
        print(f"  [{i}] Processing: {item}...")
        time.sleep(0.5)
        
    print("[+] Automation execution complete. Saving to CSV.")
    with open("results.csv", "w") as f:
        f.write("id,category\\n")
        for i, item in enumerate(dataset, 1):
            f.write(f"{i},{item}\\n")
    print("[+] File results.csv written to disk.")

if __name__ == "__main__":
    scrape_and_format()`;

      files["requirements.txt"] = `requests==2.31.0
beautifulsoup4==4.12.2
pandas==2.1.1`;
    } 
    
    else if (type === "agent") {
      files["agent.py"] = `# Autonomous ReAct Agent Loop: ${title}
import time

class IntelligentAgent:
    def __init__(self, key_goal):
        self.goal = key_goal
        self.memory = []
        
    def think(self):
        print(f"[Agent]: Reasoning about goal: '{self.goal}'")
        time.sleep(0.8)
        return "query_vector_store"
        
    def act(self, tool_name):
        print(f"[Agent]: Invoking Tool: {tool_name} with context parameters...")
        time.sleep(1)
        return "Found: Vibe coding leverages models for fast prototyping."
        
    def evaluate(self, observation):
        print(f"[Agent]: Checking tool outcomes: '{observation}'")
        time.sleep(0.8)
        self.memory.append(observation)
        return "goal_achieved"

if __name__ == "__main__":
    agent = IntelligentAgent("Explain modern coding speed improvements")
    action = agent.think()
    obs = agent.act(action)
    status = agent.evaluate(obs)
    print(f"[Final Output]: {status.upper()} -> Agent finished task successfully.")`;

      files["prompt.txt"] = `System Prompt:
You are an autonomous ReAct agent. You have access to:
1. Google Search
2. Local File Writer
3. Python Interpreter

Follow the cycle: Thought, Action, Action Input, Observation.`;
    } 
    
    else if (type === "data") {
      files["analyzer.py"] = `# Pandas dataset visualizer for: ${title}
import pandas as pd
import numpy as np

def run_analysis():
    print("[*] Generating statistical mockup variables...")
    np.random.seed(42)
    
    # Create random study scores relative to study hours
    hours = np.random.uniform(1, 10, 100)
    scores = hours * 10 + np.random.normal(0, 5, 100)
    
    df = pd.DataFrame({'Study_Hours': hours, 'Test_Score': np.clip(scores, 0, 100)})
    print(f"[*] Row counts: {len(df)}")
    
    correlation = df['Study_Hours'].corr(df['Test_Score'])
    print(f"[Stats]: Study Hours vs Test Score correlation coefficient: {correlation:.4f}")
    
    # Impute missing cells
    df.fillna(df.mean(), inplace=True)
    df.to_csv("cleaned_scores.csv", index=False)
    print("[+] Cleaned dataframe saved.")

if __name__ == "__main__":
    run_analysis()`;
      
      files["cleaned_scores.csv"] = `Study_Hours,Test_Score
4.5,48.2
7.2,74.5
1.8,22.1
9.5,95.3
5.1,51.8`;
    }

    return {
      title: title,
      type: type,
      files: files,
      milestones: milestones,
      xpReward: 150
    };
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AI_ENGINE };
}
