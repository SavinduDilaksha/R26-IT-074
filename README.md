# R26-IT-074
# AquaVision: ML/DL and IoT Driven Smart Aquarium System

Repository Link : https://github.com/SavinduDilaksha/R26-IT-074.git

Welcome to the frontend repository for the **AquaVision Smart Aquarium System**, a comprehensive research project developed to modernize and automate aquarium management using Machine Learning (ML), Deep Learning (DL), and Internet of Things (IoT) technologies.

This repository contains the unified dashboard codebase that integrates four major research components into a single, cohesive user experience designed for aquarium owners, researchers, and hobbyists.

---

## 📌 Project Overview

**Project Title:** ML/DL and IoT Driven Smart Aquarium System  
**Target Species:** Ornamental fish (Specifically Molly fish)  

The system is designed to provide real-time monitoring, AI-driven insights, and automated controls to ensure the optimal health and environment for ornamental fish. The architecture leverages Edge AI inference on Raspberry Pi with dual-camera setups and an array of IoT sensors, delivering processed data to this React-based dashboard.

### 🧩 Core System Components (Research Modules)

This dashboard unifies the work of 4 research members:

1. **🐟 Fish Stress Detection (Late Fusion Architecture)**
   - **Focus:** Real-time stress detection combining Computer Vision (CV) behavioral analysis and IoT environmental data.
   - **Features:** Live camera feed with YOLOv8n bounding boxes, Stress Level Trends, Sensor safe ranges, and actionable emergency Care Guides.
2. **🦠 Fish Disease Detection**
   - **Focus:** Vision health monitoring and early disease identification using Deep Learning models.
   - **Features:** Visual anomaly detection and treatment recommendations.
3. **💧 Water Quality Monitoring (XAI)**
   - **Focus:** Real-time tracking of water parameters with eXplainable AI (XAI) insights.
   - **Features:** Analytics on pH, Temperature, Ammonia (NH3), and Turbidity.
4. **🍽️ Automated Feeding**
   - **Focus:** Behavior-driven smart feeding schedules and portion control.
   - **Features:** Automated dispensers integrated with AI appetite detection.

---

## 🛠️ Technology Stack

**Frontend & UI**
- React 19 / Vite
- Tailwind CSS (Dark-themed, Glassmorphism UI)
- Lucide React (Iconography)
- Recharts (Data visualization & trending)

**AI & Edge Inference (Backend Context)**
- **Model:** YOLOv8n (Nano) for real-time object detection and behavior classification.
- **Hardware:** Raspberry Pi, 2 Pi Cameras (Top & Front view).
- **Sensors:** pH, Temperature, Ammonia, Turbidity.
- **Database/Auth:** Firebase (Integration pending).

---

## 🚀 Getting Started

Follow these instructions to set up the project on your local machine for development and testing.

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm or yarn

### Installation

1. **Clone or unzip the repository:**
   Navigate into the project directory (ensure you do not copy `node_modules` or `dist` folders when transferring the project).
   ```bash
   cd fish-dashboard
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 💻 Available Scripts

In the project directory, you can run the following commands:

| Command | Description |
|---|---|
| `npm run dev` | Starts the Vite development server with Hot Module Replacement (HMR). |
| `npm run build` | Compiles and optimizes the application for production into the `dist/` folder. |
| `npm run preview` | Boots up a local web server to serve the production build from `dist/`. |
| `npm run lint` | Runs ESLint/TypeScript checks to ensure code quality. |

---

## 🏗️ Architecture & Structure

- `src/components/layout/` - Global layout wrappers (Sidebar, Topbar, MainLayout).
- `src/components/ui/` - Reusable UI elements (BubbleBackground, TabNavigation).
- `src/pages/` - Core module views:
  - `HomePage.jsx` - Unified dashboard overview.
  - `FishStress/` - The comprehensive stress detection module containing Dashboard, Live Monitoring, Sensor Data, Stress History, and Care Guide tabs.
  - Placeholder pages for Feeding, Water Quality, and Disease components.
- `src/data/mockData.js` - Centralized mock data structure simulating IoT streams and AI inferences before Firebase integration.

---

## 📝 Note for Supervisors & Reviewers

This iteration of the frontend demonstrates the **UI/UX flow, data visualization strategies, and the integration layout** of the four independent research components. The **Fish Stress Detection** module is currently populated with robust simulated data (real-time fluctuations, AI bounding box UI, and actionable health logic) to demonstrate the "Late Fusion" concept prior to backend hardware deployment.
