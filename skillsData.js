// skillsData.js
// Stores all the nodes, coordinates, prerequisites, lessons, quizzes, and projects for the RPG Skill Tree

const SKILLS_DATA = {
  // Programming Track
  "prog_fundamentals": {
    id: "prog_fundamentals",
    label: "Programming Fundamentals",
    track: "Programming",
    cost: 100,
    levelRequired: 1,
    prerequisites: [],
    x: 180,
    y: 100,
    icon: "💻",
    shortDescription: "Master loops, variables, and logic functions.",
    description: "Every great developer begins here. Learn how instructions are structured, how memory stores variables, and how computers make decisions using conditional statements.",
    lesson: {
      title: "Variables, Loops & Control Flow",
      slides: [
        "Variables act as containers to store values (e.g., age = 20, name = 'Ada'). They are the fundamental blocks of storage in programming.",
        "Conditional statements (if/else) guide program flow based on logic: 'If it is raining, take an umbrella; otherwise, wear sunglasses.'",
        "Loops (for, while) execute blocks of code repeatedly. Instead of printing a message 100 times, write a loop that runs 100 iterations."
      ]
    },
    quiz: [
      {
        question: "Which loop type is typically used when the exact number of iterations is known beforehand?",
        options: ["While loop", "For loop", "Infinite loop", "Recursive loop"],
        answer: 1,
        explanation: "A 'For loop' is ideal when you know how many times you want to iterate (e.g., over a range or array)."
      },
      {
        question: "What is the primary purpose of a variable in programming?",
        options: ["To slow down the processor", "To store data that can be referenced and manipulated", "To link web pages together", "To print logs to the screen"],
        answer: 1,
        explanation: "Variables act as labeled containers in computer memory to store and manipulate data dynamically."
      }
    ],
    challenge: {
      type: "code",
      instruction: "Write a simple loop structure. Fill in the missing part to print numbers 0 to 4 in JavaScript.",
      template: "for (let i = 0; i < 5; ______ ) {\n  console.log(i);\n}",
      expected: "i++",
      feedback: "Great job! Incrementing 'i++' ensures the loop moves closer to its exit condition."
    }
  },

  "python": {
    id: "python",
    label: "Python Programming",
    track: "Programming",
    cost: 200,
    levelRequired: 1,
    prerequisites: ["prog_fundamentals"],
    x: 180,
    y: 250,
    icon: "🐍",
    shortDescription: "Learn Python syntax, lists, dictionaries, and file operations.",
    description: "Python is the undisputed king of AI, Data Science, and scripting. Learn its elegant, readable syntax, data types, and file-handling utilities.",
    lesson: {
      title: "Python Data Structures & Clean Code",
      slides: [
        "Python is dynamically typed: you don't need to declare whether a variable is an integer or string explicitly.",
        "Lists `my_list = [1, 2, 3]` are ordered, mutable collections. Dictionaries `my_dict = {'key': 'value'}` store key-value mapping.",
        "List comprehensions allow writing elegant loops: `squares = [x**2 for x in range(5)]` generates `[0, 1, 4, 9, 16]`."
      ]
    },
    quiz: [
      {
        question: "How do you define an key-value dictionary in Python?",
        options: ["my_dict = [1, 2, 3]", "my_dict = {1, 2, 3}", "my_dict = {'id': 101, 'name': 'AI'}", "my_dict = (101, 'AI')"],
        answer: 2,
        explanation: "Curly braces containing key-value pairs separated by colons define dictionaries in Python."
      },
      {
        question: "What will `print('AI'[0])` output in Python?",
        options: ["A", "I", "AI", "Error"],
        answer: 0,
        explanation: "Python indices start at 0, so accessing the index 0 of the string 'AI' returns the first character 'A'."
      }
    ],
    challenge: {
      type: "code",
      instruction: "Write a list comprehension to double each item in a list called 'nums'.",
      template: "doubled = [x * 2 for x in ______]",
      expected: "nums",
      feedback: "Splendid! The variable 'nums' serves as the iterable collection we are loop-comprehending over."
    }
  },

  "web_dev": {
    id: "web_dev",
    label: "Modern Web Development",
    track: "Programming",
    cost: 250,
    levelRequired: 2,
    prerequisites: ["prog_fundamentals"],
    x: 80,
    y: 400,
    icon: "🌐",
    shortDescription: "Build interactive layouts using HTML5, CSS Grid, and JS.",
    description: "Learn how the modern web is structured, styled, and animated. Master DOM manipulation to connect interactive elements to logic code.",
    lesson: {
      title: "HTML5, CSS layout systems, and DOM Manipulation",
      slides: [
        "HTML5 provides semantic structure: `<header>`, `<main>`, `<article>`, and `<footer>` tag sets organize layout content logically.",
        "CSS Grid and Flexbox handle responsive, modern designs. Glassmorphism relies on `backdrop-filter: blur()` and transparent border colors.",
        "JavaScript connects pages to dynamic logic: `document.getElementById('myBtn').addEventListener('click', ...)` drives interactions."
      ]
    },
    quiz: [
      {
        question: "Which CSS property is crucial to achieving standard frosted-glass (glassmorphism) transparency effects?",
        options: ["background-color: transparent", "backdrop-filter: blur(10px)", "filter: blur(10px)", "opacity: 0.5"],
        answer: 1,
        explanation: "'backdrop-filter' applies visual effects (like blur) to the area behind an element, giving the frosted-glass feel."
      }
    ],
    challenge: {
      type: "code",
      instruction: "Select an element with id 'header' using standard JavaScript vanilla DOM methods.",
      template: "const header = document._________________('header');",
      expected: "getElementById",
      feedback: "Awesome! getElementById matches the ID attribute exactly."
    }
  },

  "data_structures": {
    id: "data_structures",
    label: "Data Structures & Algos",
    track: "Programming",
    cost: 300,
    levelRequired: 3,
    prerequisites: ["python"],
    x: 280,
    y: 400,
    icon: "📊",
    shortDescription: "Optimize storage and performance using Arrays, Stacks, Queues, and Trees.",
    description: "Write code that scales. Explore algorithmic efficiency (Big O notation) and data configurations like linked lists, hash tables, and graphs.",
    lesson: {
      title: "Complexity and Structural Organization",
      slides: [
        "Big O notation quantifies how code execution time or memory space scales as dataset size increases. O(1) is constant, O(N) is linear.",
        "Hash Tables map key identifiers to array indices using hashing algorithms, facilitating extremely fast O(1) search/insertion lookups.",
        "Trees and Graphs connect nodes non-linearly. Standard traversal strategies include Depth-First (DFS) and Breadth-First (BFS) search."
      ]
    },
    quiz: [
      {
        question: "What is the average search time complexity in a Hash Table (Hash Map)?",
        options: ["O(1)", "O(N)", "O(log N)", "O(N^2)"],
        answer: 0,
        explanation: "Using mathematical key hashing, Hash Tables directly resolve locations in average constant time, O(1)."
      }
    ],
    challenge: {
      type: "code",
      instruction: "What notation is used to represent absolute constant time complexity in Big O analysis?",
      template: "O(____)",
      expected: "1",
      feedback: "Perfect! O(1) indicates that execution time remains independent of dataset size."
    }
  },

  // AI Track
  "ai_fundamentals": {
    id: "ai_fundamentals",
    label: "AI Fundamentals",
    track: "AI Fundamentals",
    cost: 100,
    levelRequired: 1,
    prerequisites: [],
    x: 500,
    y: 100,
    icon: "🧠",
    shortDescription: "Intro to AI history, Neural Networks, and AI terminology.",
    description: "Demystify AI. Trace its journey from expert systems and search heuristics to modern Deep Learning, large language modeling, and AI agent frameworks.",
    lesson: {
      title: "AI Ecosystem: From Heuristics to LLMs",
      slides: [
        "Artificial Intelligence represents any system mimicking cognitive tasks. Machine Learning is a subset that learns patterns from datasets.",
        "Neural Networks pass input numbers through hidden node layers containing adjustable weights and biases, minimizing error over training runs.",
        "Modern AI systems are driven by Transformers: architectures utilizing self-attention coefficients to weigh token contexts sequentially."
      ]
    },
    quiz: [
      {
        question: "Which mathematical mechanism allowed large language models to contextually weigh all words in a sentence concurrently?",
        options: ["Backpropagation", "Self-Attention", "Gradient Descent", "Max Pooling"],
        answer: 1,
        explanation: "The Attention mechanism (from the Transformer paper) allows models to link words across long contexts simultaneously."
      }
    ],
    challenge: {
      type: "quiz",
      instruction: "Type 'ML' or 'DL' to specify which is a direct subset of the other. Machine Learning is the parent, Deep Learning is the subfield.",
      template: "Deep Learning is a subset of standard __________.",
      expected: "ML",
      feedback: "Correct! DL (Deep Learning) specifically utilizes deep neural networks under the broader ML umbrella."
    }
  },

  "machine_learning": {
    id: "machine_learning",
    label: "Machine Learning",
    track: "AI Fundamentals",
    cost: 200,
    levelRequired: 2,
    prerequisites: ["ai_fundamentals", "python"],
    x: 500,
    y: 250,
    icon: "⚙️",
    shortDescription: "Supervised vs Unsupervised models, Linear Regression, and Classifiers.",
    description: "Understand supervised learning (labels guide training) and unsupervised learning (grouping unlabeled items). Program models like SVMs and Random Forests.",
    lesson: {
      title: "Algorithms & Training Pipelines",
      slides: [
        "Supervised Learning mapping: Inputs -> Targets. Used for classification (cat vs dog) and regression (predicting house prices).",
        "Unsupervised Learning groups unlabelled datasets by structural traits. K-Means clustering is a prime example.",
        "Overfitting is when a model memorizes training samples too closely, resulting in high training accuracy but terrible validation/test performance."
      ]
    },
    quiz: [
      {
        question: "What issue is a model suffering from if it scores 99% accuracy on training data but fails to generalize to test datasets?",
        options: ["Underfitting", "Overfitting", "Gradient descent", "Data imputation"],
        answer: 1,
        explanation: "Overfitting happens when a model learns noise in training, losing generalization capability on unseen datasets."
      }
    ],
    challenge: {
      type: "code",
      instruction: "In machine learning libraries like Scikit-Learn, which standard function method triggers model training?",
      template: "model._______(X_train, y_train)",
      expected: "fit",
      feedback: "Superb! The .fit() command trains the model by adjusting variables using inputs."
    }
  },

  "deep_learning": {
    id: "deep_learning",
    label: "Deep Learning & Neural Nets",
    track: "AI Fundamentals",
    cost: 300,
    levelRequired: 3,
    prerequisites: ["machine_learning"],
    x: 400,
    y: 400,
    icon: "👁️",
    shortDescription: "Build neural network architectures using layers, backpropagation, and weights.",
    description: "Plunge into multi-layered neural structures. Understand how backpropagation distributes gradients, activation functions shape signals, and training optimization works.",
    lesson: {
      title: "Layers, Loss, and Backpropagation",
      slides: [
        "Deep Networks consist of an Input layer, multiple Hidden layers, and an Output layer. Non-linear activation (like ReLU) introduces complex curves.",
        "Loss functions compute the margin of error between model predictions and target labels. Backpropagation propagates this error backwards.",
        "Optimizers (like SGD or Adam) adjust neuron weights in the direction that lowers the overall loss calculation (Gradient Descent)."
      ]
    },
    quiz: [
      {
        question: "Which activation function outputs 0 for negative input values, and outputs the input value directly for positive values?",
        options: ["Sigmoid", "Tanh", "ReLU", "Softmax"],
        answer: 2,
        explanation: "ReLU (Rectified Linear Unit) is defined as max(0, x), outputting zero for negative numbers and propagating positive values unchanged."
      }
    ],
    challenge: {
      type: "quiz",
      instruction: "What stands for the primary mathematical technique used to calculate error derivatives across network layers?",
      template: "Back_________________",
      expected: "propagation",
      feedback: "Spot on! Backpropagation calculates gradients of loss relative to network parameters."
    }
  },

  "prompt_eng": {
    id: "prompt_eng",
    label: "Prompt Engineering",
    track: "Prompt Engineering",
    cost: 150,
    levelRequired: 1,
    prerequisites: ["ai_fundamentals"],
    x: 600,
    y: 400,
    icon: "✍️",
    shortDescription: "Master Few-Shot, Chain-of-Thought, and role-based instruction systems.",
    description: "Become a model whisperer. Move past simple inputs and construct robust prompts that enforce formats, handle instructions, and reason logically.",
    lesson: {
      title: "Prompt Design Frameworks",
      slides: [
        "Few-Shot prompting provides the model with target-input target-output examples before launching the user prompt.",
        "Chain-of-Thought (CoT) asks the model to output its intermediate reasoning. Writing 'Let's think step by step' drastically improves accuracy.",
        "System Prompts instruct the model on role, boundaries, tone (e.g. 'You are a concise grading assistant. Output ONLY JSON')."
      ]
    },
    quiz: [
      {
        question: "Which prompting technique involves showing 2-3 examples of input/output pairs in the prompt text?",
        options: ["Zero-shot prompting", "Few-shot prompting", "System prompt override", "Recursive prompting"],
        answer: 1,
        explanation: "Few-shot prompting feeds sample input-output pairs to prime the LLM's pattern matching prior to request execution."
      }
    ],
    challenge: {
      type: "prompt",
      instruction: "Improve this prompt to make the AI output reasoning before answering: 'Calculate 15% of 850.'",
      template: "Calculate 15% of 850. Let's think ______ __ ______.",
      expected: "step by step",
      feedback: "Excellent! Instructing the model to think 'step by step' triggers Chain-of-Thought reasoning."
    }
  },

  "ai_agents": {
    id: "ai_agents",
    label: "AI Agents & Tool Use",
    track: "AI Fundamentals",
    cost: 350,
    levelRequired: 4,
    prerequisites: ["deep_learning", "prompt_eng"],
    x: 500,
    y: 550,
    icon: "🤖",
    shortDescription: "Build autonomous loops using ReAct patterns, Vector DBs, and API tools.",
    description: "Design systems that ACT. Build autonomous loops where LLMs search files (RAG), read API endpoints, run logic modules, and refine actions dynamically.",
    lesson: {
      title: "ReAct loop architectures & Retrieval-Augmented Generation",
      slides: [
        "The ReAct (Reasoning + Acting) loop tells LLMs: Think -> Select Tool -> Execute Tool -> Observe Output -> Think again.",
        "Retrieval-Augmented Generation (RAG) queries vector stores for relevant documents, inserting them into the prompt window to avoid hallucinations.",
        "Agentic loops operate autonomously. They review their own work, adjust plans when tasks fail, and output finalized results."
      ]
    },
    quiz: [
      {
        question: "What does RAG stand for in the context of integrating custom external databases with LLMs?",
        options: ["Randomized AI Generation", "Retrieval-Augmented Generation", "Recursive Agent Grid", "Reverse Access Gradient"],
        answer: 1,
        explanation: "RAG stands for Retrieval-Augmented Generation, injecting relevant database passages directly into the model context."
      }
    ],
    challenge: {
      type: "code",
      instruction: "In agent frameworks, what loop paradigm coordinates Reasoning and Acting steps consecutively?",
      template: "The ______ framework.",
      expected: "ReAct",
      feedback: "Outstanding! ReAct coordinates thought generation with action invocation loops."
    }
  },

  // Data Science Track
  "data_science": {
    id: "data_science",
    label: "Data Science & Viz",
    track: "Data Science",
    cost: 250,
    levelRequired: 2,
    prerequisites: ["python", "machine_learning"],
    x: 340,
    y: 550,
    icon: "📈",
    shortDescription: "Clean datasets, perform analytics, and render interactive visuals using Pandas/Matplotlib.",
    description: "Data is gold. Master data processing, exploratory analysis, vector computations, and charts using Pandas, NumPy, and Matplotlib.",
    lesson: {
      title: "Data Manipulation & Analytics",
      slides: [
        "Pandas structures data into DataFrames (similar to relational tables). Rows are indexed, columns hold structured data types.",
        "Data cleaning includes filling missing null cells (imputation), parsing anomalies, and scaling numeric features.",
        "Visualizations (scatter, line, bar, heatmap charts) uncover structural patterns and trends hidden inside tabular raw data."
      ]
    },
    quiz: [
      {
        question: "Which Python package is the industry standard for tabular data manipulation (DataFrames)?",
        options: ["NumPy", "Pandas", "Matplotlib", "SciPy"],
        answer: 1,
        explanation: "Pandas provides data structures and high-performance operations for manipulating numerical tables and time series."
      }
    ],
    challenge: {
      type: "code",
      instruction: "In Pandas, write the method name that drops rows containing missing values (NaNs).",
      template: "df_cleaned = df.___________()",
      expected: "dropna",
      feedback: "Perfect! .dropna() filters out rows that contain missing cell entries."
    }
  },

  // Vibe Coding Track
  "vibe_coding": {
    id: "vibe_coding",
    label: "Vibe Coding Master",
    track: "Vibe Coding",
    cost: 300,
    levelRequired: 3,
    prerequisites: ["web_dev", "prompt_eng"],
    x: 180,
    y: 600,
    icon: "🎵",
    shortDescription: "Co-pilot development: prompt AI, review codes, and deploy projects rapidly.",
    description: "Vibe Coding is programming by conveying system goals, letting AI write, refactor, and connect code. Focus on architecture, product design, and prompt control.",
    lesson: {
      title: "AI Co-piloting & Prompt Iteration",
      slides: [
        "Vibe coding redirects developer effort from syntax typing to architectural design, logic review, and prompt curation.",
        "Iterate incrementally: don't prompt a full project instantly. Prompt the basic component, verify, then prompt updates.",
        "Refactoring with AI: describe performance bottlenecks or structural issues and ask the AI to refactor for legibility."
      ]
    },
    quiz: [
      {
        question: "What is a core best practice when 'Vibe Coding' complex products?",
        options: ["Prompt the entire code in a single go", "Develop incrementally, verifying small functional features one-by-one", "Never read the code generated by the AI", "Write all the CSS manually first"],
        answer: 1,
        explanation: "Building iteratively allows validating logic blocks individually, keeping complexity under prompt control."
      }
    ],
    challenge: {
      type: "prompt",
      instruction: "Complete the description: Vibe Coding relies on utilizing AI models as ______________.",
      template: "AI models serve as our virtual ______________.",
      expected: "co-pilots",
      feedback: "Excellent! The developer guides architecture while the AI serves as a typing co-pilot."
    }
  },

  // AI Tool Mastery Track
  "ai_tool_mastery": {
    id: "ai_tool_mastery",
    label: "AI Tool Mastery",
    track: "AI Tool Mastery",
    cost: 100,
    levelRequired: 1,
    prerequisites: [],
    x: 820,
    y: 100,
    icon: "🛠️",
    shortDescription: "Overview of modern AI utilities, pricing models, and ecosystems.",
    description: "Identify and leverage AI tools. Understand prompt interfaces, system options, and how to connect tools into digital workflows.",
    lesson: {
      title: "AI Tools Overview",
      slides: [
        "AI tools cover diverse categories: text agents (chatbots), code co-pilots, media builders, data tools, and research engines.",
        "Workflows connect these platforms: e.g. using a research tool to gather notes, a chatbot to draft, and an image gen tool to style.",
        "Mastering AI tools involves choosing the right tool for a task and knowing how to format inputs to get clean outputs."
      ]
    },
    quiz: [
      {
        question: "Which tool category does Midjourney or DALL-E belong to?",
        options: ["Coding Assistants", "Image Generation", "Research Tools", "Data Science Tools"],
        answer: 1,
        explanation: "Midjourney and DALL-E are classic examples of text-to-image generative media tools."
      }
    ],
    challenge: {
      type: "quiz",
      instruction: "Type 'chatbot' or 'co-pilot' to classify ChatGPT and Claude.",
      template: "ChatGPT and Claude are classified as dynamic AI __________ interfaces.",
      expected: "chatbots",
      feedback: "Excellent! These general-purpose dialogue agents are classified as chatbots."
    }
  },

  "chatbots": {
    id: "chatbots",
    label: "Advanced Chatbots",
    track: "AI Tool Mastery",
    cost: 150,
    levelRequired: 1,
    prerequisites: ["ai_tool_mastery"],
    x: 740,
    y: 250,
    icon: "💬",
    shortDescription: "Master system prompts, parameters (temp, top_p), and custom GPTs.",
    description: "Go beyond conversational defaults. Master API configurations: Temperature (creativity), Top P (diversity), and custom instructions.",
    lesson: {
      title: "Temperature, Context, and Custom Rules",
      slides: [
        "Temperature scales output randomness. 0.0 makes outputs deterministic (great for code/math); 1.0 makes them highly creative.",
        "Context Window denotes how many tokens the model can read at once. Exceeding the window causes the model to forget earlier inputs.",
        "Custom Instructions (or system prompts) enforce behaviors, rules, or formatting styles across conversation threads."
      ]
    },
    quiz: [
      {
        question: "What temperature setting is recommended for logical, deterministic tasks like coding?",
        options: ["1.5", "1.0", "0.0", "0.8"],
        answer: 2,
        explanation: "A temperature of 0.0 forces the model to select the highest-probability tokens, yielding consistent results."
      }
    ],
    challenge: {
      type: "quiz",
      instruction: "What variable dictates the token-reading limits of an LLM before context overflows?",
      template: "The ___________ window.",
      expected: "context",
      feedback: "Correct! The context window controls the maximum amount of input and history a model can process."
    }
  },

  "coding_assistants": {
    id: "coding_assistants",
    label: "AI Code Assistants",
    track: "AI Tool Mastery",
    cost: 150,
    levelRequired: 1,
    prerequisites: ["ai_tool_mastery"],
    x: 900,
    y: 250,
    icon: "🤖",
    shortDescription: "Configure IDE plugins: Copilot, Cursor, inline prompting, and chat interfaces.",
    description: "Supercharge your workspace. Integrate tools directly inside code editors. Master inline prompt editing, agent mode, and workspace indexing.",
    lesson: {
      title: "IDE Integrations & Context Reference",
      slides: [
        "Modern IDEs (like Cursor or VS Code with plugins) index codebases into vector stores, allowing code references like '@file' or '@folder'.",
        "Inline edits (e.g. Cmd+K or Ctrl+K) let you select lines of code and prompt modifications directly in place.",
        "Agent editors can locate files, review build errors, run local compilation tests, and write patches automatically."
      ]
    },
    quiz: [
      {
        question: "Which feature allows an AI assistant inside your IDE to read, understand, and reference your entire project codebase?",
        options: ["Codebase Indexing", "Cloud backup", "Syntax highlighting", "Prettier configuration"],
        answer: 0,
        explanation: "Workspace Indexing generates local vector embeddings of your files, letting the AI analyze project relationships."
      }
    ],
    challenge: {
      type: "quiz",
      instruction: "Fill in the command prefix often used in AI code editors to invoke inline edits (Ctrl+K or Cmd+K). Type 'K'.",
      template: "Press Ctrl + ____ to edit inline.",
      expected: "K",
      feedback: "Spot on! Ctrl+K/Cmd+K triggers inline prompt editing in modern AI code editors."
    }
  },

  "generative_media": {
    id: "generative_media",
    label: "Generative Media & Models",
    track: "AI Tool Mastery",
    cost: 250,
    levelRequired: 2,
    prerequisites: ["chatbots", "coding_assistants"],
    x: 820,
    y: 400,
    icon: "🎨",
    shortDescription: "Text-to-Image, Video Synthesis, aspect ratios, seeds, and style weights.",
    description: "Generate stunning art, UI designs, and synthetic video. Master parameters like aspect ratios, seed locking, image-to-image, and control nets.",
    lesson: {
      title: "Seeds, Styling, and Diffusion Controllers",
      slides: [
        "Diffusion models generate images by starting with random noise and refining it step-by-step to match prompt descriptions.",
        "Seed numbers act as starting points. Locking a seed allows you to modify prompts while keeping the overall composition consistent.",
        "Aspect ratio parameters (e.g. --ar 16:9) structure target canvas shapes for widescreen displays or mobile screens."
      ]
    },
    quiz: [
      {
        question: "Why would you lock the 'seed' parameter in an image generation model?",
        options: ["To speed up generation", "To maintain visual consistency across subsequent prompt modifications", "To increase image resolution", "To bypass content moderation filters"],
        answer: 1,
        explanation: "Locking the seed ensures the random starting noise remains identical, allowing consistent structural variations."
      }
    ],
    challenge: {
      type: "quiz",
      instruction: "What models generate images by iteratively removing noise from a canvas layout? (Diffusion or Autoregressive)",
      template: "__________ models.",
      expected: "Diffusion",
      feedback: "Superb! Diffusion models refine images by removing noise."
    }
  }
};

// Exports for modularity if needed in node/browser environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SKILLS_DATA };
}
