# RepoLens

> **Understand any GitHub repository in under 60 seconds.**

RepoLens is a web-based GitHub repository analyzer that turns a public repository into an interactive, developer-friendly dashboard.

Instead of manually exploring files, dependencies, repository metadata, and Pull Requests, RepoLens provides a centralized view of how a codebase is organized and what is inside it.

---

## ✨ Features

### 📊 Repository Overview
Get a quick snapshot of a repository, including:

- Stars
- Forks
- Watchers
- Open issues
- Primary language
- License
- Repository size
- Default branch
- Repository activity
- Topics and metadata

### 🌐 Language Breakdown

Visualize the languages used throughout the repository and understand the relative size of each language in the codebase.

### 📁 Interactive File Explorer

Explore the complete repository structure through an interactive file tree.

- Folders and files
- File sizes
- Expand/collapse navigation
- Repository-wide file search

### 📦 Dependency Analysis

Automatically detect JavaScript/TypeScript dependencies from `package.json` and display them in an easy-to-understand format.

### 🔗 Dependency Graph

View direct project dependencies through a visual relationship graph.

### 🏗️ Architecture View

Understand the high-level organization of the repository and how its major components are structured.

### 🔥 Codebase Hotspots

Identify areas of the repository that deserve additional attention when exploring or reviewing an unfamiliar project.

### ❤️ Repository Health

Get a quick overview of important repository health signals.

### 🔀 Pull Request Impact

Enter a GitHub Pull Request URL or number and inspect:

- PR title
- Author
- State
- Additions
- Deletions
- Number of changed files
- Changed file paths
- Direct link to the Pull Request

This makes it easier to understand the scope of a change without manually inspecting every modified file.

### 📖 README Analysis

RepoLens retrieves the repository's `README.md` when available and incorporates it into the analysis.

### 🕘 Analysis History

Recently analyzed repositories are stored locally in the browser so you can quickly return to projects you previously inspected.

> Analysis history is stored locally and does not require an account.

### 📄 Markdown Reports

Generate a Markdown report from a repository analysis and download it for documentation or review.

### 🔗 Shareable Analysis URLs

Every repository analysis has its own URL based on the repository owner and name, making analyses easy to bookmark and share.

---

## 🧠 How It Works

RepoLens follows a simple workflow:

```text
GitHub Repository
       │
       ▼
Parse Repository URL
       │
       ▼
GitHub REST API
       │
       ├── Repository Metadata
       ├── Languages
       ├── Contributors
       ├── File Tree
       └── Pull Requests
       │
       ▼
Repository Analysis
       │
       ├── Overview
       ├── Explorer
       ├── Dependencies
       ├── Graph
       ├── Architecture
       ├── Hotspots
       ├── Health
       └── PR Impact
       │
       ▼
Interactive Dashboard
```

### Repository Analysis

1. Enter a repository such as `facebook/react` or a full GitHub URL.
2. RepoLens parses the repository reference.
3. The application retrieves repository information from GitHub.
4. It fetches available language statistics, contributors, and the repository's file tree.
5. When available, `README.md` and `package.json` are retrieved from the default branch.
6. The collected information is transformed into an interactive analysis dashboard.

---

## 🛠️ Tech Stack

### Frontend

- React 18
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Radix UI
- Lucide React
- Recharts
- Framer Motion

### Backend

- Node.js
- Express
- TypeScript

### APIs

- GitHub REST API
- GitHub raw content endpoints

### Development Tools

- pnpm
- Vitest
- Prettier
- TypeScript

### Deployment

- Netlify configuration included

---

## 📁 Project Structure

```text
RepoLens/
│
├── client/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Layout.tsx
│   │   │   ├── SiteFooter.tsx
│   │   │   ├── SiteHeader.tsx
│   │   │   └── ThemeProvider.tsx
│   │   └── ui/
│   │       └── ...shared UI components
│   ├── hooks/
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   ├── lib/
│   │   ├── github.ts
│   │   ├── utils.ts
│   │   └── utils.spec.ts
│   ├── pages/
│   │   ├── AnalysisSearch.tsx
│   │   ├── Index.tsx
│   │   ├── NotFound.tsx
│   │   ├── Placeholder.tsx
│   │   └── RepoDashboard.tsx
│   ├── App.tsx
│   └── global.css
├── server/
│   ├── index.ts
│   ├── node-build.ts
│   └── routes/
│       └── demo.ts
├── netlify/
│   └── functions/
│       └── api.ts
├── shared/
│   └── api.ts
├── public/
│   ├── favicon.ico
│   ├── placeholder.svg
│   └── robots.txt
├── package.json
├── pnpm-lock.yaml
├── vite.config.ts
├── vite.config.server.ts
├── tailwind.config.ts
├── tsconfig.json
└── netlify.toml
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have:

- Node.js
- pnpm
- Git

### Clone the Repository

```bash
git clone https://github.com/jainelvora/RepoLens.git
cd RepoLens
```

### Install Dependencies

```bash
pnpm install
```

### Start Development Server

```bash
pnpm dev
```

The application will start using the Vite development server.

---

## 🏗️ Build

Build the client and server:

```bash
pnpm build
```

The build process runs:

```bash
pnpm build:client
pnpm build:server
```

---

## ▶️ Production

After building the project:

```bash
pnpm start
```

---

## 🧪 Testing

Run the test suite:

```bash
pnpm test
```

---

## 🔍 Type Checking

Run TypeScript type checking:

```bash
pnpm typecheck
```

---

## 🎨 Formatting

Format the project using Prettier:

```bash
pnpm format.fix
```

---

## 🔐 GitHub API & Rate Limits

RepoLens currently works with **public GitHub repositories** through GitHub's public REST API.

Because unauthenticated requests are made to GitHub's API, GitHub's API rate limits can apply.

If the rate limit is reached, RepoLens displays an appropriate error instead of silently failing.

### Authentication

Authentication is intentionally not required for the current version.

This keeps the application:

- Simple to use
- Easy to deploy
- Accessible without account creation
- Suitable for analyzing public repositories

Authenticated GitHub access can be added in a future version if higher API limits or private repository support becomes necessary.

---

## 🎯 Use Cases

RepoLens is designed for developers who need to understand repositories quickly.

### 👨‍💻 Developers

Quickly understand an unfamiliar codebase before making changes.

### 🎓 Students

Explore real-world open-source repositories and learn how production projects are structured.

### 🔍 Code Review

Get a high-level view of repository changes and Pull Request impact.

### 🤝 Open-Source Contributors

Understand a project before contributing without manually exploring the entire repository.

### 🧑‍💼 Technical Interviews

Use repository analysis to quickly understand a project's architecture and technology stack.

### 📚 Learning

Study how different open-source projects organize their code, dependencies, and architecture.

---

## 📌 Example

Enter:

```text
facebook/react
```

RepoLens will generate an analysis dashboard containing information such as:

```text
Repository
├── Overview
├── Language Breakdown
├── File Explorer
├── Dependencies
├── Dependency Graph
├── Architecture
├── Hotspots
├── Health
└── PR Impact
```

---

## 🗺️ Roadmap

The current architecture provides a foundation for deeper repository intelligence.

Potential future improvements include:

- [ ] GitHub authentication
- [ ] Private repository analysis
- [ ] Higher API rate limits
- [ ] Support for Python `requirements.txt`
- [ ] Support for `pyproject.toml`
- [ ] Support for Java Maven/Gradle projects
- [ ] Support for Go modules
- [ ] Support for Rust Cargo projects
- [ ] Advanced dependency analysis
- [ ] Improved architecture detection
- [ ] Commit activity analysis
- [ ] Contributor activity analysis
- [ ] Code-quality metrics
- [ ] AI-powered repository summaries
- [ ] AI-powered codebase Q&A
- [ ] Advanced dependency visualization
- [ ] Exportable HTML reports
- [ ] PDF reports
- [ ] Repository comparison
- [ ] Historical repository analysis

---

## 🤝 Contributing

Contributions, suggestions, and bug reports are welcome.

### 1. Fork the repository

```bash
git fork https://github.com/jainelvora/RepoLens
```

### 2. Create a feature branch

```bash
git checkout -b feature/your-feature
```

### 3. Make your changes

Implement and test your changes locally.

### 4. Run checks

```bash
pnpm test
pnpm typecheck
pnpm format.fix
```

### 5. Commit your changes

```bash
git add .
git commit -m "feat: add your feature"
```

### 6. Push the branch

```bash
git push origin feature/your-feature
```

### 7. Open a Pull Request

Describe:

- What changed
- Why it was needed
- How it was tested

---

## 📄 License

No open-source license has currently been specified for this repository.

If you intend to make RepoLens an open-source project, add an appropriate license such as the MIT License.

---

## 👤 Author

**Jainel Vora**

GitHub: https://github.com/jainelvora

---

## ⭐ Support

If RepoLens helps you understand a repository faster, consider giving the project a ⭐ on GitHub.

---

<p align="center">
  Built with React, TypeScript, Vite, and the GitHub API.
</p>
