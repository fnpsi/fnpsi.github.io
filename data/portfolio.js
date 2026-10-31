window.portfolioData = {
  owner: "Function Psi",
  bio: "Builder of weird, wonderful, and useful things on the internet.",
  tagline: "One of the coolest websites out there.",
  social: {
    x: "https://x.com/fnpsi_",
    ig: "https://instagram.com/fnpsi",
    yt: "https://youtube.com/@fnpsi"
  },
  /* ------------------------------------------------------------------
     Add your own projects here. Each project needs:
       id        - unique number
       title     - project name
       category  - e.g. Web App, Experiment, Tool, OS
       description - short blurb
       emoji     - icon shown on the card
       url       - live link (or "#")
       github    - repo link (or "#")
       featured  - true to highlight
     ------------------------------------------------------------------ */
  projects: [
    {
      id: 1,
      title: "Ψ Digital Lab (this site)",
      category: "Operating System",
      description: "A desktop-style web app with a window manager, tool vault, generative app builder, code editor, and portfolio archive.",
      emoji: "💻",
      url: "https://fnpsi.github.io",
      github: "https://github.com/fnpsi/fnpsi.github.io",
      featured: true
    },
    {
      id: 2,
      title: "Your Custom Project",
      category: "Web App",
      description: "Replace this placeholder in data/portfolio.js with your own project. Add title, description, URL, and GitHub link.",
      emoji: "🚀",
      url: "#",
      github: "#"
    },
    {
      id: 3,
      title: "Coming Soon",
      category: "Experiment",
      description: "Work in progress. Check back or build it together in the Ψ Generator.",
      emoji: "🧪",
      url: "#",
      github: "#"
    }
  ]
};
