// toolsData.js
// Modern AI Tools directory details, comparisons, and categorization

const TOOLS_DATA = [
  // Chatbots
  {
    id: "chatgpt",
    name: "ChatGPT",
    category: "Chatbots",
    developer: "OpenAI",
    pricing: "Freemium ($20/mo Plus)",
    useCase: "General copywriting, brain-storming, programming advice, and custom GPT agents.",
    strengths: "Fast responses, custom GPT store, advanced data analysis features, voice mode.",
    weaknesses: "Can hallucinate complex citations; rate-limits on newest reasoning models.",
    link: "https://chatgpt.com"
  },
  {
    id: "claude",
    name: "Claude",
    category: "Chatbots",
    developer: "Anthropic",
    pricing: "Freemium ($20/mo Pro)",
    useCase: "Coding complex logic, writing academic/poetic copy, and parsing massive code repositories.",
    strengths: "Large context window (200k+ tokens), excellent coding syntax, Artifacts UI interface.",
    weaknesses: "Fewer built-in tools (e.g., no default image generation/web browsing search integrations).",
    link: "https://claude.ai"
  },
  {
    id: "perplexity",
    name: "Perplexity",
    category: "Chatbots/Research Tools",
    developer: "Perplexity AI",
    pricing: "Freemium ($20/mo Pro)",
    useCase: "Real-time web research, citing articles, mapping sources, and finding fresh links.",
    strengths: "Cites all resources, supports selecting focus modes (academic, writing, code), multi-file analysis.",
    weaknesses: "Occasionally synthesizes contradictory points from different sources.",
    link: "https://perplexity.ai"
  },

  // Coding Assistants
  {
    id: "copilot",
    name: "GitHub Copilot",
    category: "Coding Assistants",
    developer: "Microsoft / GitHub",
    pricing: "$10/mo (Free for students/OSS)",
    useCase: "Autocomplete syntax lines, write docstrings, translate functions, and chat inside the IDE.",
    strengths: "Directly plugs into VS Code and JetBrains; reads surrounding files; fast autocomplete.",
    weaknesses: "Slightly less active codebase-wide editing control compared to Cursor agent modes.",
    link: "https://github.com/features/copilot"
  },
  {
    id: "cursor",
    name: "Cursor",
    category: "Coding Assistants",
    developer: "Anysphere",
    pricing: "Freemium ($20/mo Pro)",
    useCase: "Editing codebases, codebase-wide search, instant bug fixes, and autogenerating multi-file patches.",
    strengths: "Indices the full project workspace; cmd+K inline editing; multi-file Composer interface.",
    weaknesses: "A completely custom fork of VS Code, requiring moving configuration setups.",
    link: "https://cursor.com"
  },
  {
    id: "v0_dev",
    name: "v0.dev",
    category: "Coding Assistants",
    developer: "Vercel",
    pricing: "Freemium (Credits-based)",
    useCase: "Generating full front-end React, HTML, and Tailwind UI components from text prompts.",
    strengths: "Renders active UI drafts in real-time, supports copy-paste React code, looks gorgeous.",
    weaknesses: "Tailored mostly to Tailwind CSS and React/Next.js frameworks.",
    link: "https://v0.dev"
  },

  // Image Generation
  {
    id: "midjourney",
    name: "Midjourney",
    category: "Image Generation",
    developer: "Midjourney Inc.",
    pricing: "Paid only (From $10/mo)",
    useCase: "High-art conceptual illustrations, character design, visual backgrounds, and textures.",
    strengths: "Unmatched photorealism, artistic styling textures, rich panning/zooming functions.",
    weaknesses: "Requires Discord (though Web UI exists); no direct canvas vector export features.",
    link: "https://midjourney.com"
  },
  {
    id: "dalle_3",
    name: "DALL-E 3",
    category: "Image Generation",
    developer: "OpenAI",
    pricing: "Included in ChatGPT Plus / Free on Bing",
    useCase: "Generating graphic designs, logos, cartoon illustrations, and rendering text in images.",
    strengths: "Flawless instruction following, handles descriptive text render inside images.",
    weaknesses: "Outputs can look overly smooth or typical of AI art styling filters.",
    link: "https://openai.com/dall-e-3"
  },

  // Video Generation
  {
    id: "sora",
    name: "Sora",
    category: "Video Generation",
    developer: "OpenAI",
    pricing: "Enterprise / Pro",
    useCase: "Generating realistic 60-second video clips from text prompts with detailed physics simulation.",
    strengths: "Impressive physical consistency, high resolutions, rich camera movements.",
    weaknesses: "Highly restricted public access; can struggle with complex cause-and-effect physics.",
    link: "https://openai.com/sora"
  },
  {
    id: "runway_gen2",
    name: "Runway Gen-2",
    category: "Video Generation",
    developer: "Runway",
    pricing: "Freemium ($15/mo Standard)",
    useCase: "Generating cinematic video loops from text prompts or reference images (image-to-video).",
    strengths: "Rich image-to-video control, custom brush tools to direct specific element movements.",
    weaknesses: "Can suffer from facial morphing or logical inconsistencies over longer loops.",
    link: "https://runwayml.com"
  },

  // Research Tools
  {
    id: "notebook_lm",
    name: "NotebookLM",
    category: "Research Tools",
    developer: "Google",
    pricing: "Free",
    useCase: "Synthesizing notes, creating study guides, and converting documents into an AI audio podcast.",
    strengths: "Absolute citation anchoring; handles PDFs, Google Docs, and web links; audio podcast summary.",
    weaknesses: "Limited model configuration variables; operates exclusively within uploaded notebook sources.",
    link: "https://notebooklm.google"
  },

  // Data Science Tools
  {
    id: "julius_ai",
    name: "Julius AI",
    category: "Data Science Tools",
    developer: "Julius AI",
    pricing: "Freemium ($20/mo Pro)",
    useCase: "Analyzing spreadsheets, generating python graphs, modeling forecasts, and data cleaning.",
    strengths: "Performs regression, imports raw CSV files, prints interactive Matplotlib charts.",
    weaknesses: "Requires clear data structure columns to avoid script errors.",
    link: "https://julius.ai"
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TOOLS_DATA };
}
