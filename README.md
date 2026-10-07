# CyberDNA - AI-Powered Personal Cybersecurity Command Center

> "Your Digital Identity. Your Cyber Defense. Your Evolution."

CyberDNA is a venture-backed style cybersecurity SaaS platform designed to transform regular users into active security assets. The platform learns user behavior, models security risk profiles through a simulated AI Cyber Twin, trains defensive skills inside interactive simulation scenarios, provides real-time threat detection, and audits family risk levels.

---

## 🎨 Design System & Visual Aesthetics

CyberDNA is built on a dark command-center aesthetic, focusing on premium corporate enterprise software styling.
- **Primary Background**: Dark Graphite (`#111315`)
- **Secondary Background**: Charcoal (`#1B1F23`)
- **Card Elements**: Warm Dark Gray (`#24282D`)
- **Success & Integrity States**: Cyber Emerald (`#18A572`)
- **Warning & Caution Indicators**: Amber (`#F4A340`)
- **Threat Alerts & Malicious Verdicts**: Soft Red (`#E05252`)
- **Typography**: Inter (UI layout) / Manrope (Premium Headers) / IBM Plex Sans (Security log consoles)

---

## 🛠️ Key Product Modules

### 1. AI Cyber Twin Profiler
Analyzes cognitive biases and calculates susceptibility metrics (phishing, social engineering, privacy exposure). Features an interactive **Privacy Scanner** database auditor and background **Permission Intelligence** app manager.

### 2. Cyber Arena Training Room
A realistic simulator environment running live scenarios (Internship frauds, QR discount scams, panic banking SMS). Tracks decision paths and **reaction clock speeds** to generate detailed performance reports.

### 3. Scam Shield Analyzer
A real-time scanner supporting verification of hyperlinks, copy-pasted texts, screenshots, and email headers. Provides trust scores and signature analysis verdicts (Secure, Suspicious, High Risk).

### 4. Incident Recovery Center
A containment assistant prompting users to report security compromises. Generates customized checklists (password modifications, token invalidation, MFA triggers) and records mitigation progress.

### 5. Family Protection Dashboard
A centralized dashboard to monitor risk exposure indexes and alert backlogs for parents and children. Protects data privacy using isolation wrappers (no message monitoring).

### 6. Threat Intelligence Feed
A decentralized community alert network where users report zero-day scams in real-time to immediately push blocking parameters to all active platform clients.

---

## 💻 Tech Stack & Architecture

- **Frontend**: React (Vite) + Lucide Vector Icons + Custom responsive CSS variables layout. Includes automatic LocalStorage state backup which mimics the Express backend if offline.
- **Backend**: Node.js + Express + Cors + API endpoints managing statistics and state validation.
- **Data Schemas**: JSON profile stores simulating MongoDB structures.

---

## 🚀 Getting Started

Ensure you have [Node.js](https://nodejs.org/) (v18+) installed.

### 1. Installation
Install project packages for both folders:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Running the Platform

Run the backend Express server:
```bash
npm run backend
# Backend will start on http://localhost:5000
```

Run the frontend React application:
```bash
npm run frontend
# Frontend will start on http://localhost:5173
```

Open your browser at the frontend address, click **Login** or **Get Protected** to start your cyber onboarding.
