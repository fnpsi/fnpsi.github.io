# Function Psi — Ψ Digital Lab

> **One of the coolest websites out there.**

A desktop-style personal website / web app for **Function Psi**. Mix of **why.university** (playful, experimental) and **v0.dev** (generative UI builder). Runs entirely on GitHub Pages — no build step.

## Live

`https://fnpsi.github.io`

## What's inside

| App | What it does |
|-----|--------------|
| **Tool Vault** | 22+ curated tools across Development, Design, Productivity, Utilities, Learning, AI & ML. Filter by category, click to open. |
| **Ψ Generator** | v0-style chat: describe a mini tool (button, todo list, dice roller, gradient text), get live HTML/CSS/JS preview + copy code. |
| **Portfolio Archive** | Your projects, bio, and social links (X @fnpsi_, IG fnpsi, YT @fnpsi). |
| **Course Catalog** | why.university-style experimental "degrees." |
| **Settings** | Dark/light theme toggle. |

Desktop OS feel: draggable/resizable windows, taskbar, start menu, desktop icons, window minimize/close, neon glassmorphism, and animated mesh background.

## 🕹️ Easter egg

Click the **FxΨ logo** (taskbar or start menu) **5 times** to activate **Cool Mode** — rainbow window borders, spinning logo, and intensified scanlines. Click 5 more times to deactivate.

## Deploy to GitHub Pages

1. Create a repo named exactly `fnpsi.github.io` (all lowercase).
2. Upload everything from this folder to the repo root.
3. Settings → Pages → Source: "Deploy from a branch" → Branch: `main` → Folder: `/ (root)` → Save.
4. Live at `https://fnpsi.github.io`.

## Adding your own projects

Edit `data/portfolio.js`:

```js
window.portfolioData = {
  owner: "Function Psi",
  social: {
    x: "https://x.com/fnpsi_",
    ig: "https://instagram.com/fnpsi",
    yt: "https://youtube.com/@fnpsi"
  },
  projects: [
    {
      id: 10,
      title: "My New Project",
      category: "Web App",
      description: "What it does.",
      emoji: "🚀",
      url: "https://yourproject.com",
      github: "https://github.com/fnpsi/repo"
    }
  ]
};
```

Push and Pages redeploys automatically.

## Adding tools

Edit `data/tools.json` and add entries to the `tools` array. Each tool needs: `id`, `name`, `category`, `description`, `url`, `emoji`, `tags`.

## Brand

- Owner: Function Psi
- Logo: **FxΨ** (Function + Psi)
- Colors: violet + cyan + magenta on dark slate
- Tagline: One of the coolest websites out there.

MIT License — fork it, break it, rebuild it.
