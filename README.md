# VIANNA

Visual Analytics for Neuropsychological Assessments (CANTAB)

## Overview

VIANNA is a modular visual analytics environment developed within the AI-Mind project to explore and analyze data from the Cambridge Neuropsychological Test Automated Battery (CANTAB). Built in close collaboration with clinical researchers, the system supports exploratory analysis through coordinated multiple views and a workflow-oriented interface.

## Key Capabilities

- Cohort exploration and interactive filtering
- Data wrangling and preprocessing workflows
- Group comparison and temporal trajectory analysis
- Correlation exploration across measures
- Hierarchical navigation to manage complex neuropsychological datasets

## Tech Stack

- React + Vite
- Redux Toolkit
- Ant Design
- D3.js

## Getting Started

Requirements

- Node.js 20+ (CI uses 20)

Install and run

```bash
npm install
npm run dev
```

Build and preview

```bash
npm run build
npm run preview
```

## Deployment (GitHub Pages)

This project is configured for GitHub Pages via GitHub Actions.

Steps

1. Ensure `vite.config.js` has `base: "/<REPO_NAME>/"`.
2. In GitHub: `Settings` → `Pages` → `Source` = `GitHub Actions`.
3. Push to `main`. The workflow in `.github/workflows/deploy.yml` will build and publish `dist`.

The site will be available at:
`https://<USER>.github.io/<REPO_NAME>/`

## Acknowledgements

Developed within the AI-Mind project in collaboration with clinical researchers.
