# 🚨 Sentinel — Hospitality Crisis Response Platform

> **Unifying guests, staff, and first responders during emergencies — in real time.**

[![Hackathon](https://img.shields.io/badge/Hackathon-2025-blue)]()
[![Status](https://img.shields.io/badge/Status-Prototype-orange)]()
[![License](https://img.shields.io/badge/License-MIT-green)]()

---

## 🎯 The Problem

Hospitality venues face unpredictable, high-stakes emergencies — fires, medical incidents, security threats — that demand **instantaneous, coordinated reactions**. Yet during a crisis, critical information is siloed:

- 🧍 **Guests** don't know who to contact or how fast help is coming
- 👷 **Staff** lack coordination, duplicating effort or missing incidents entirely
- 🚑 **First responders** arrive without context, losing precious minutes

**Fragmented communication costs lives.**

---

## 💡 Our Solution

**Sentinel** is a real-time, multi-role crisis response platform that creates a highly reliable bridge between distressed individuals, on-site personnel, and emergency services.

One platform. Three synchronized dashboards. Zero information silos.

---

## ✨ Key Features

### For Guests
- 🆘 **One-Tap SOS Button** — Report emergencies in under 2 seconds
- 🎙️ **Voice-to-Incident Reporting** — Describe emergencies hands-free
- 🌐 **Multi-Language Support** — English, Spanish, French
- 📍 **Live Status Tracking** — See help arriving in real time

### For Staff
- ⚡ **Real-Time Incident Feed** — WebSocket-powered live updates
- 🎯 **Claim & Respond Workflow** — Clear ownership of each incident
- 🗺️ **Mini Floor Map** — Know exactly where to go
- 🔔 **Critical Alert Sounds** — Never miss a high-severity event

### For Command Center
- 🖥️ **Full Venue Dashboard** — Large interactive floor map with live markers
- 🧠 **AI Severity Triage** — Auto-classifies incidents (Critical/High/Medium/Low)
- 📊 **Heatmap Overlay** — Visualize incident density across the venue
- 📢 **Broadcast Alerts** — Push evacuation/lockdown notices venue-wide
- 📄 **First Responder Briefings** — One-click PDF context for arriving EMS/Fire/Police
- ⏱️ **Auto-Escalation** — Unclaimed incidents escalate after 60 seconds
- 🔌 **Resilience Mode** — Queues reports offline, syncs on reconnect

---

---

## 🛠️ Tech Stack

**Frontend:** React 18 · TypeScript · Vite · Tailwind CSS · shadcn/ui · Framer Motion · Recharts
**Backend:** Node.js · Express · Socket.IO
**Real-Time:** WebSockets (Socket.IO)
**Extras:** Web Speech API · jsPDF · Howler.js

---

## 🚀 Quick Start

```bash
# Clone the repo
git clone https://github.com/<your-username>/sentinel.git
cd sentinel

# Install dependencies
npm install

# Start the app (client + server)
npm run dev

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
